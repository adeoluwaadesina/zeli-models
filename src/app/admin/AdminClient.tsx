"use client";

import * as React from "react";
import type { ZeliModel } from "@/data/models";
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

const HEIGHT_RE = /^\d{1,2}'\d{1,2}"?$/;

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
            {model.height} • {model.images.length} images
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

export function AdminClient({ initial }: { initial: ZeliModel[] }) {
  const [models, setModels] = React.useState<ZeliModel[]>(initial);
  const [status, setStatus] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ZeliModel>({
    id: "",
    name: "",
    height: "",
    bio: "",
    images: []
  });
  const [, setNewFiles] = React.useState<File[]>([]);
  const [heightError, setHeightError] = React.useState<string>("");
  const [imageItems, setImageItems] = React.useState<ImageItem[]>([]);

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
    setDraft({ id: "", name: "", height: "", bio: "", images: [] });
    setNewFiles([]);
    setImageItems([]);
    setEditorOpen(true);
  };

  const openEdit = (m: ZeliModel) => {
    setEditingId(m.id);
    setDraft({ ...m, images: [...m.images] });
    setNewFiles([]);
    setImageItems(m.images.slice(0, 5).map((url, i) => ({ id: `ex-${i}-${url}`, kind: "existing", url })));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    cleanupNewPreviews();
    setEditorOpen(false);
    setNewFiles([]);
    setImageItems([]);
    setHeightError("");
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
    if (!res.ok) throw new Error("Upload init failed");
    const data = (await res.json()) as {
      uploads?: { signedUrl: string; publicUrl: string; contentType: string }[];
    };
    if (!Array.isArray(data.uploads)) throw new Error("Invalid upload response");

    // Upload directly to Supabase Storage signed URLs (bypasses Vercel body limits).
    await Promise.all(
      data.uploads.map(async (u, idx) => {
        const file = files[idx];
        const put = await fetch(u.signedUrl, {
          method: "PUT",
          headers: { "content-type": u.contentType || file.type || "application/octet-stream" },
          body: file
        });
        if (!put.ok) throw new Error("Direct upload failed");
      })
    );

    return data.uploads.map((u) => u.publicUrl);
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    const height = draft.height.trim();
    const bio = draft.bio.trim();
    if (!name || !height || !bio) {
      setStatus("Please fill name, height, and bio.");
      return;
    }

    if (!HEIGHT_RE.test(height)) {
      setHeightError(`Use format like 5'10 or 5'10"`);
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
    } catch {
      setSaving(false);
      setStatus("Image upload failed.");
      return;
    } finally {
      setSaving(false);
    }

    const next: ZeliModel = { id, name, height, bio, images };
    const nextModels =
      editingId === null
        ? [...models, next]
        : models.map((m) => (m.id === editingId ? next : m));

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
        <button className={styles.btn} type="button" onClick={openAdd}>
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
                  <input
                    id="m-height"
                    className={styles.input}
                    value={draft.height}
                    onChange={(e) =>
                      setDraft((d) => {
                        const next = e.target.value
                          .replace(/[^\d'"]/g, "")
                          .slice(0, 6);
                        setHeightError("");
                        return { ...d, height: next };
                      })
                    }
                    placeholder={`e.g. 5'10"`}
                    inputMode="numeric"
                    pattern="\\d{1,2}'\\d{1,2}"
                    maxLength={6}
                    aria-invalid={heightError ? "true" : "false"}
                  />
                  {heightError ? (
                    <div className={styles.meta} role="alert">
                      {heightError}
                    </div>
                  ) : null}
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

