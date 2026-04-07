"use client";

import * as React from "react";
import { normalizeModel, type ZeliModel } from "@/data/models";
import styles from "./page.module.css";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ImageItem =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; file: File; previewUrl: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(base: string, existing: Set<string>) {
  let id = base;
  let n = 2;
  while (existing.has(id)) {
    id = `${base}-${n}`;
    n++;
  }
  return id;
}

function SortableRow({
  model,
  onEdit,
  onDelete,
  childrenRight
}: {
  model: ZeliModel;
  onEdit: () => void;
  onDelete: () => void;
  childrenRight: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: model.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.row} ${isDragging ? styles.rowDragging : ""} ${
        isDragging ? styles.rowLifted : ""
      }`}
      style={style}
      role="listitem"
    >
      <div className={styles.rowLeft}>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className={styles.dragHandle}
          aria-label={`Drag to reorder ${model.name}`}
          {...attributes}
          {...listeners}
        >
          <span className={styles.dragDots} aria-hidden="true" />
        </button>
        <div>
          <div className={styles.name}>{model.name}</div>
          <div className={styles.meta}>
            {model.gender === "male" ? "Male" : "Female"} • {model.featured ? "Featured" : "-"} •{" "}
            {model.height} • {model.images.length} img
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} type="button" onClick={onEdit}>
          Edit
        </button>
        <button className={styles.btn} type="button" onClick={onDelete}>
          Delete
        </button>
        {childrenRight}
      </div>
    </div>
  );
}

function parseHeight(height: string): { feet: string; inches: string } {
  const m = /^(\d{1,2})'(\d{1,2})/.exec(height.trim());
  if (!m) return { feet: "", inches: "" };
  return { feet: m[1] ?? "", inches: m[2] ?? "" };
}

function emptyModel(): ZeliModel {
  return normalizeModel({
    id: "",
    name: "",
    height: `5'9"`,
    bio: "",
    images: []
  });
}

function validateFeaturedList(list: ZeliModel[]): string | null {
  const f = list.filter((m) => m.featured);
  if (f.length > 4) return "At most 4 models can be featured on the home page.";
  for (const m of f) {
    if (m.featuredOrder == null || m.featuredOrder < 0 || m.featuredOrder > 3) {
      return "Each featured model needs a slot 0–3.";
    }
  }
  const ord = f.map((m) => m.featuredOrder as number);
  if (new Set(ord).size !== ord.length) return "Featured slots must be unique (0–3).";
  return null;
}

export function AdminClient({ initial }: { initial: ZeliModel[] }) {
  const [models, setModels] = React.useState<ZeliModel[]>(initial);
  const [status, setStatus] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ZeliModel>(emptyModel);
  const [tagsInput, setTagsInput] = React.useState("");
  const [, setNewFiles] = React.useState<File[]>([]);
  const [heightError, setHeightError] = React.useState<string>("");
  const [heightFeet, setHeightFeet] = React.useState("");
  const [heightInches, setHeightInches] = React.useState("");
  const [imageItems, setImageItems] = React.useState<ImageItem[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = React.useState<File | null>(null);

  const cleanupNewPreviews = React.useCallback(() => {
    imageItems.forEach((it) => {
      if (it.kind === "new") URL.revokeObjectURL(it.previewUrl);
    });
  }, [imageItems]);

  const refreshFromServer = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/models", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { models?: ZeliModel[] };
      if (Array.isArray(data.models)) setModels(data.models);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // In case models.json was changed outside this session.
    void refreshFromServer();
  }, [refreshFromServer]);

  const saveAll = async (nextModels: ZeliModel[]) => {
    const v = validateFeaturedList(nextModels);
    if (v) {
      setStatus(v);
      return;
    }
    setSaving(true);
    setStatus("Saving...");
    try {
      const res = await fetch("/api/admin/models", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ models: nextModels })
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("Saved");
      window.setTimeout(() => setStatus(""), 1200);
    } catch {
      setStatus("Could not save (check login)");
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setDraft(emptyModel());
    setTagsInput("");
    setNewFiles([]);
    setImageItems([]);
    setHeightFeet("");
    setHeightInches("");
    setFeaturedImageFile(null);
    setEditorOpen(true);
  };

  const openEdit = (m: ZeliModel) => {
    setEditingId(m.id);
    setDraft({ ...m, images: [...m.images] });
    setTagsInput(m.tags.join(", "));
    setNewFiles([]);
    setImageItems(m.images.slice(0, 5).map((url, i) => ({ id: `ex-${i}-${url}`, kind: "existing", url })));
    const parsed = parseHeight(m.height);
    setHeightFeet(parsed.feet);
    setHeightInches(parsed.inches);
    setFeaturedImageFile(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    cleanupNewPreviews();
    setEditorOpen(false);
    setNewFiles([]);
    setImageItems([]);
    setHeightError("");
    setHeightFeet("");
    setHeightInches("");
    setTagsInput("");
    setFeaturedImageFile(null);
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = Math.max(0, 5 - imageItems.length);
    const picked = Array.from(files).slice(0, remaining);
    if (picked.length === 0) return;
    const newItems: ImageItem[] = picked.map((file) => ({
      id: `new-${crypto.randomUUID()}`,
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImageItems((prev) => [...prev, ...newItems].slice(0, 5));
    setNewFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const uploadFiles = async (modelId: string, files: File[]) => {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        modelId,
        files: files.map((f) => ({ name: f.name, type: f.type }))
      })
    });
    const data = (await res.json().catch(async () => {
      // If the server returned non-JSON, fall back to text.
      const text = await res.text().catch(() => "");
      return { error: text || `HTTP ${res.status}` };
    })) as {
      error?: string;
      uploads?: {
        signedUrl: string;
        token?: string;
        path?: string;
        publicUrl: string;
        contentType: string;
      }[];
    };
    if (!res.ok) {
      throw new Error(
        `Upload init failed (${res.status})${data.error ? `: ${data.error}` : ""}`
      );
    }
    if (!Array.isArray(data.uploads)) throw new Error("Invalid upload response");

    // Upload directly to Supabase Storage signed URLs (bypasses Vercel body limits).
    await Promise.all(
      data.uploads.map(async (u, idx) => {
        const file = files[idx];
        const put = await fetch(u.signedUrl, {
          method: "PUT",
          headers: {
            "content-type": u.contentType || file.type || "application/octet-stream",
            "x-upsert": "true"
          },
          body: file
        });
        if (!put.ok) {
          let extra = "";
          try {
            extra = await put.text();
          } catch {
            // ignore
          }
          throw new Error(`Direct upload failed (${put.status})${extra ? `: ${extra}` : ""}`);
        }
      })
    );

    return data.uploads.map((u) => u.publicUrl);
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    const feet = heightFeet.trim();
    const inches = heightInches.trim();
    const height = `${feet}'${inches}"`;
    const bio = draft.bio.trim();
    if (!name || !height || !bio) {
      setStatus("Please fill name, height, and bio.");
      return;
    }

    if (!/^\d{1,2}$/.test(feet) || !/^\d{1,2}$/.test(inches)) {
      setHeightError("Enter feet and inches as numbers.");
      setStatus("Invalid height.");
      return;
    }

    const inchesNum = Number(inches);
    if (Number.isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11) {
      setHeightError('Inches must be between 0 and 11.');
      setStatus("Invalid height format.");
      return;
    }

    const existingIds = new Set(models.map((m) => m.id));
    const baseId = slugify(draft.id || name) || "model";
    const id =
      editingId && editingId === draft.id
        ? draft.id
        : uniqueId(baseId, existingIds);

    // Build final image order from the items list.
    const existingUrls: string[] = [];
    const newUploads: { id: string; file: File }[] = [];
    imageItems.forEach((it) => {
      if (it.kind === "existing") existingUrls.push(it.url);
      else newUploads.push({ id: it.id, file: it.file });
    });

    let images = [...existingUrls].slice(0, 5);
    try {
      if (newUploads.length > 0) {
        setSaving(true);
        setStatus("Uploading images...");
        const uploaded = await uploadFiles(
          id,
          newUploads.map((u) => u.file)
        );
        let uploadedIdx = 0;
        const finalUrls: string[] = [];
        for (const it of imageItems) {
          if (it.kind === "existing") finalUrls.push(it.url);
          else finalUrls.push(uploaded[uploadedIdx++] ?? "");
        }
        images = finalUrls.filter(Boolean).slice(0, 5);
      }
    } catch (e) {
      setSaving(false);
      setStatus(e instanceof Error ? e.message : "Image upload failed.");
      return;
    } finally {
      setSaving(false);
    }

    let featuredImageUrlOut = draft.featured ? draft.featuredImageUrl : "";
    if (draft.featured && featuredImageFile) {
      try {
        setSaving(true);
        setStatus("Uploading featured image...");
        const urls = await uploadFiles(id, [featuredImageFile]);
        featuredImageUrlOut = urls[0] ?? draft.featuredImageUrl;
      } catch (e) {
        setSaving(false);
        setStatus(e instanceof Error ? e.message : "Featured image upload failed.");
        return;
      } finally {
        setSaving(false);
      }
    }
    if (!draft.featured) {
      featuredImageUrlOut = "";
    }

    const tags = tagsInput
      .split(/[,|·]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const featured = draft.featured;
    const featuredOrder = featured ? draft.featuredOrder : null;
    if (featured && (featuredOrder == null || featuredOrder < 0 || featuredOrder > 3)) {
      setStatus("Featured models need a unique slot from 0 to 3.");
      return;
    }

    const next: ZeliModel = normalizeModel({
      id,
      name,
      height,
      bio,
      images,
      gender: draft.gender,
      featured,
      featuredOrder: featured ? featuredOrder : null,
      tags,
      chest: draft.chest.trim(),
      waist: draft.waist.trim(),
      shoe: draft.shoe.trim(),
      eyes: draft.eyes.trim(),
      hair: draft.hair.trim(),
      heightCm: draft.heightCm.trim(),
      featuredImageUrl: featuredImageUrlOut
    });

    const nextModels =
      editingId === null
        ? [...models, next]
        : models.map((m) => (m.id === editingId ? next : m));

    const v = validateFeaturedList(nextModels);
    if (v) {
      setStatus(v);
      return;
    }

    setModels(nextModels);
    closeEditor();
    await saveAll(nextModels);
  };

  const removeModel = async (id: string) => {
    if (!window.confirm("Delete this model?")) return;
    const nextModels = models.filter((m) => m.id !== id);
    setModels(nextModels);
    await saveAll(nextModels);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const imageSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function SortableThumb({
    item,
    onRemove
  }: {
    item: ImageItem;
    onRemove: () => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: item.id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition
    };
    const src = item.kind === "existing" ? item.url : item.previewUrl;

    return (
      <div
        ref={setNodeRef}
        className={`${styles.thumb} ${isDragging ? styles.thumbDragging : ""}`}
        style={style}
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.thumbImg} src={src} alt="" draggable={false} />
        <button
          type="button"
          className={styles.thumbBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove image"
        >
          <span className={styles.thumbX}>×</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.toolbar} ${styles.toolbarLeft}`}>
        <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={openAdd}>
          Add model
        </button>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={styles.status} aria-live="polite">
            {status}
          </span>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
            onClick={() => void saveAll(models)}
            disabled={saving}
          >
            Save changes
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) return;
          if (active.id === over.id) return;
          const oldIndex = models.findIndex((m) => m.id === active.id);
          const newIndex = models.findIndex((m) => m.id === over.id);
          if (oldIndex < 0 || newIndex < 0) return;
          const nextModels = arrayMove(models, oldIndex, newIndex);
          setModels(nextModels);
          setStatus("Reordered (click Save changes)");
          window.setTimeout(() => setStatus(""), 1400);
        }}
      >
        <SortableContext
          items={models.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.card} role="list" aria-label="Models order list">
            {models.map((m) => (
              <SortableRow
                key={m.id}
                model={m}
                onEdit={() => openEdit(m)}
                onDelete={() => void removeModel(m.id)}
                childrenRight={null}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editorOpen ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Edit model"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditor();
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit model" : "Add model"}
              </h2>
              <button className={styles.btn} type="button" onClick={closeEditor}>
                Close
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-name">
                    Name
                  </label>
                  <input
                    id="m-name"
                    className={styles.input}
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, name: e.target.value }))
                    }
                    placeholder="Model name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-height">
                    Height
                  </label>
                  <div className={styles.heightRow}>
                    <input
                      id="m-height"
                      className={`${styles.input} ${styles.heightPart}`}
                      value={heightFeet}
                      onChange={(e) => {
                        setHeightError("");
                        setHeightFeet(e.target.value.replace(/\D/g, "").slice(0, 2));
                      }}
                      placeholder="ft"
                      inputMode="numeric"
                      aria-label="Height feet"
                    />
                    <span className={styles.heightSep} aria-hidden="true">
                      '
                    </span>
                    <input
                      className={`${styles.input} ${styles.heightPart}`}
                      value={heightInches}
                      onChange={(e) => {
                        setHeightError("");
                        setHeightInches(e.target.value.replace(/\D/g, "").slice(0, 2));
                      }}
                      placeholder="in"
                      inputMode="numeric"
                      aria-label="Height inches"
                    />
                    <span className={styles.heightSep} aria-hidden="true">
                      "
                    </span>
                  </div>
                  {heightError ? (
                    <div className={styles.meta} role="alert">
                      {heightError}
                    </div>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-gender">
                    Board
                  </label>
                  <select
                    id="m-gender"
                    className={styles.input}
                    value={draft.gender}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        gender: e.target.value === "male" ? "male" : "female"
                      }))
                    }
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="m-bio">
                  Bio
                </label>
                <textarea
                  id="m-bio"
                  className={styles.textarea}
                  value={draft.bio}
                  onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                  placeholder="Short modelling bio"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="m-tags">
                  Tags (comma-separated)
                </label>
                <input
                  id="m-tags"
                  className={styles.input}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Editorial, Runway, Commercial"
                />
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-featured">
                    <input
                      id="m-featured"
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setDraft((d) => ({
                          ...d,
                          featured: on,
                          featuredOrder: on ? d.featuredOrder ?? 0 : null,
                          featuredImageUrl: on ? d.featuredImageUrl : ""
                        }));
                        if (!on) setFeaturedImageFile(null);
                      }}
                    />{" "}
                    Featured on home (max 4)
                  </label>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-forder">
                    Featured slot (0–3)
                  </label>
                  <input
                    id="m-forder"
                    className={styles.input}
                    type="number"
                    min={0}
                    max={3}
                    disabled={!draft.featured}
                    value={draft.featuredOrder ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDraft((d) => ({
                        ...d,
                        featuredOrder: v === "" ? null : Number(v)
                      }));
                    }}
                  />
                </div>
              </div>

              {draft.featured ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-ft-img">
                    Featured home card image
                  </label>
                  <p className={styles.meta}>
                    Optional. If unset, the first portfolio image is used on the home page.
                  </p>
                  {draft.featuredImageUrl ? (
                    <div className={styles.meta}>
                      <a href={draft.featuredImageUrl} target="_blank" rel="noreferrer">
                        Current featured image
                      </a>{" "}
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => {
                          setDraft((d) => ({ ...d, featuredImageUrl: "" }));
                          setFeaturedImageFile(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                  <input
                    id="m-ft-img"
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeaturedImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              ) : null}

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-chest">
                    Chest
                  </label>
                  <input
                    id="m-chest"
                    className={styles.input}
                    value={draft.chest}
                    onChange={(e) => setDraft((d) => ({ ...d, chest: e.target.value }))}
                    placeholder='e.g. 32"'
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-waist">
                    Waist
                  </label>
                  <input
                    id="m-waist"
                    className={styles.input}
                    value={draft.waist}
                    onChange={(e) => setDraft((d) => ({ ...d, waist: e.target.value }))}
                    placeholder='e.g. 24"'
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-shoe">
                    Shoe
                  </label>
                  <input
                    id="m-shoe"
                    className={styles.input}
                    value={draft.shoe}
                    onChange={(e) => setDraft((d) => ({ ...d, shoe: e.target.value }))}
                    placeholder="US / EU"
                  />
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-eyes">
                    Eyes
                  </label>
                  <input
                    id="m-eyes"
                    className={styles.input}
                    value={draft.eyes}
                    onChange={(e) => setDraft((d) => ({ ...d, eyes: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-hair">
                    Hair
                  </label>
                  <input
                    id="m-hair"
                    className={styles.input}
                    value={draft.hair}
                    onChange={(e) => setDraft((d) => ({ ...d, hair: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="m-hcm">
                    Height (cm) optional
                  </label>
                  <input
                    id="m-hcm"
                    className={styles.input}
                    value={draft.heightCm}
                    onChange={(e) => setDraft((d) => ({ ...d, heightCm: e.target.value }))}
                    placeholder="190 cm"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="m-files">
                  Upload images (append up to 5)
                </label>
                <input
                  id="m-files"
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickFiles(e.target.files)}
                />
                <div className={styles.meta}>
                  Tip: uploads append until you reach 5 images total.
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Current images</div>
                <DndContext
                  sensors={imageSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (!over) return;
                    if (active.id === over.id) return;
                    const oldIndex = imageItems.findIndex((it) => it.id === active.id);
                    const newIndex = imageItems.findIndex((it) => it.id === over.id);
                    if (oldIndex < 0 || newIndex < 0) return;
                    setImageItems((prev) => arrayMove(prev, oldIndex, newIndex));
                  }}
                >
                  <SortableContext
                    items={imageItems.map((it) => it.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className={styles.thumbs}>
                      {imageItems.slice(0, 5).map((it) => (
                        <SortableThumb
                          key={it.id}
                          item={it}
                          onRemove={() => {
                            setImageItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (it.kind === "new") {
                              URL.revokeObjectURL(it.previewUrl);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btn} type="button" onClick={closeEditor}>
                Cancel
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving}
              >
                {saving ? "Working..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

