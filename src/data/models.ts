export type ModelGender = "female" | "male";

export type ZeliModel = {
  id: string;
  name: string;
  height: string;
  bio: string;
  images: string[];
  gender: ModelGender;
  featured: boolean;
  featuredOrder: number | null;
  tags: string[];
  chest: string;
  waist: string;
  shoe: string;
  eyes: string;
  hair: string;
  heightCm: string;
  /** Home featured section only; falls back to first portfolio image if empty. */
  featuredImageUrl: string;
};

const workImages = [
  "/work/work-1.svg",
  "/work/work-2.svg",
  "/work/work-3.svg",
  "/work/work-4.svg",
  "/work/work-5.svg"
];

export function normalizeModel(partial: Partial<ZeliModel> & Pick<ZeliModel, "id" | "name">): ZeliModel {
  return {
    id: partial.id,
    name: partial.name,
    height: partial.height ?? `5'9"`,
    bio: partial.bio ?? "",
    images: Array.isArray(partial.images) ? partial.images : [],
    gender: partial.gender === "male" ? "male" : "female",
    featured: Boolean(partial.featured),
    featuredOrder:
      typeof partial.featuredOrder === "number" ? partial.featuredOrder : null,
    tags: Array.isArray(partial.tags) ? partial.tags : [],
    chest: partial.chest ?? "",
    waist: partial.waist ?? "",
    shoe: partial.shoe ?? "",
    eyes: partial.eyes ?? "",
    hair: partial.hair ?? "",
    heightCm: partial.heightCm ?? "",
    featuredImageUrl: typeof partial.featuredImageUrl === "string" ? partial.featuredImageUrl : ""
  };
}

export const MODELS: ZeliModel[] = [
  normalizeModel({
    id: "alexandra-voss",
    name: "Alexandra Voss",
    height: `5'10"`,
    bio: "Runway specialist with international experience. Featured in top fashion publications.",
    images: workImages,
    tags: ["EDITORIAL", "RUNWAY"]
  }),
  normalizeModel({
    id: "sophia-chen",
    name: "Sophia Chen",
    height: `5'9"`,
    bio: "Versatile editorial model. Known for strong portfolio and professional demeanor.",
    images: workImages,
    tags: ["EDITORIAL", "COMMERCIAL"]
  }),
  normalizeModel({
    id: "isabella-romano",
    name: "Isabella Romano",
    height: `5'11"`,
    bio: "High fashion runway model. Walked for major designers at fashion weeks worldwide.",
    images: workImages,
    tags: ["RUNWAY", "HIGH FASHION"]
  }),
  normalizeModel({
    id: "emma-larsson",
    name: "Emma Larsson",
    height: `5'8"`,
    bio: "Commercial and editorial specialist. Dynamic on camera with natural charisma.",
    images: workImages,
    tags: ["COMMERCIAL", "EDITORIAL"]
  }),
  normalizeModel({
    id: "natasha-volkova",
    name: "Natasha Volkova",
    height: `5'10"`,
    bio: "Eastern European beauty with striking features. Successful runway and print work.",
    images: workImages,
    tags: ["EDITORIAL"]
  }),
  normalizeModel({
    id: "maya-okafor",
    name: "Maya Okafor",
    height: `5'9"`,
    bio: "Editorial and commercial model. Brings authenticity and presence to every shoot.",
    images: workImages,
    tags: ["COMMERCIAL", "LIFESTYLE"]
  })
];

export function tagsDisplayLine(tags: string[]): string {
  if (!tags.length) return "";
  return tags.map((t) => t.toUpperCase()).join(" · ");
}

export function getFeaturedModels(models: ZeliModel[], limit = 4): ZeliModel[] {
  return models
    .filter((m) => m.featured)
    .sort((a, b) => {
      const ao = a.featuredOrder ?? 99;
      const bo = b.featuredOrder ?? 99;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function modelsByGender(models: ZeliModel[], gender: ModelGender): ZeliModel[] {
  return models.filter((m) => m.gender === gender);
}
