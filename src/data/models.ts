export type ZeliModel = {
  id: string;
  name: string;
  height: string;
  bio: string;
  images: string[];
};

const workImages = [
  "/work/work-1.svg",
  "/work/work-2.svg",
  "/work/work-3.svg",
  "/work/work-4.svg",
  "/work/work-5.svg"
];

export const MODELS: ZeliModel[] = [
  {
    id: "alexandra-voss",
    name: "Alexandra Voss",
    height: `5'10"`,
    bio: "Runway specialist with international experience. Featured in top fashion publications.",
    images: workImages
  },
  {
    id: "sophia-chen",
    name: "Sophia Chen",
    height: `5'9"`,
    bio: "Versatile editorial model. Known for strong portfolio and professional demeanor.",
    images: workImages
  },
  {
    id: "isabella-romano",
    name: "Isabella Romano",
    height: `5'11"`,
    bio: "High fashion runway model. Walked for major designers at fashion weeks worldwide.",
    images: workImages
  },
  {
    id: "emma-larsson",
    name: "Emma Larsson",
    height: `5'8"`,
    bio: "Commercial and editorial specialist. Dynamic on camera with natural charisma.",
    images: workImages
  },
  {
    id: "natasha-volkova",
    name: "Natasha Volkova",
    height: `5'10"`,
    bio: "Eastern European beauty with striking features. Successful runway and print work.",
    images: workImages
  },
  {
    id: "maya-okafor",
    name: "Maya Okafor",
    height: `5'9"`,
    bio: "Editorial and commercial model. Brings authenticity and presence to every shoot.",
    images: workImages
  }
];

