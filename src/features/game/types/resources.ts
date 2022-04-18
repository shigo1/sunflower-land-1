export type ResourceName =
  | "Wood"
  | "Stone"
  | "Iron"
  | "Gold"
  | "Egg"
<<<<<<< HEAD
  | "Chicken"
  | "Bee"
  | "Queen"
  | "Honey";
=======
  | "Chicken";
>>>>>>> main

export type Resource = {
  description: string;
};
export const RESOURCES: Record<ResourceName, Resource> = {
  Wood: {
    description: "Used to craft items",
  },
  Stone: {
    description: "Used to craft items",
  },
  Iron: {
    description: "Used to craft items",
  },
  Gold: {
    description: "Used to craft items",
  },
  Egg: {
    description: "Used to craft items",
  },
  Chicken: {
    description: "Used to lay eggs",
  },
<<<<<<< HEAD
  Bee: {
    description: "Used to make honey",
  },
  Queen: {
    description: "Used to make more honey",
  },
  Honey: {
    description: "Used to craft items",
  },
=======
>>>>>>> main
};
