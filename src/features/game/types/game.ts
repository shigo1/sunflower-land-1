import { Decimal } from "decimal.js-light";
import { GameEvent } from "../events";

import { CropName, SeedName } from "./crops";
import { CraftableName } from "./craftables";
import { ResourceName } from "./resources";
import { SkillName } from "./skills";

export type Reward = {
  items: {
    name: InventoryItemName;
    amount: number;
  }[];
};

export type FieldItem = {
  name: CropName;
  // Epoch time in milliseconds
  plantedAt: number;
  multiplier?: number;
  reward?: Reward;
};

export type Tree = {
  wood: Decimal;
  // Epoch time in milliseconds
  choppedAt: number;
};

<<<<<<< HEAD
export type Flower = {
  honey: Decimal;
  //Epoch time in milliseconds
  pollinatedAt: number;
};

=======
>>>>>>> main
export type Rock = {
  amount: Decimal;
  // Epoch time in milliseconds
  minedAt: number;
};

<<<<<<< HEAD
=======
export type EasterEgg = 'Red Egg' | 'Orange Egg' | 'Green Egg' | 'Blue Egg' | 'Pink Egg' | 'Purple Egg' | 'Yellow Egg' 

export const EASTER_EGGS: EasterEgg[] = ['Blue Egg', "Green Egg", "Orange Egg", "Pink Egg", "Purple Egg", "Red Egg", "Yellow Egg"]

export type EasterBunny = 'Easter Bunny'

>>>>>>> main
export type InventoryItemName =
  | CropName
  | SeedName
  | CraftableName
  | ResourceName
<<<<<<< HEAD
  | SkillName;
=======
  | SkillName
  | EasterEgg
  | EasterBunny;
>>>>>>> main

export type Inventory = Partial<Record<InventoryItemName, Decimal>>;

type PastAction = GameEvent & {
  createdAt: Date;
};

export type GameState = {
  id?: number;
  balance: Decimal;
  fields: Record<number, FieldItem>;
<<<<<<< HEAD
  flowers: Record<number, Flower>;
=======

>>>>>>> main
  trees: Record<number, Tree>;
  stones: Record<number, Rock>;
  iron: Record<number, Rock>;
  gold: Record<number, Rock>;

  inventory: Inventory;
  stock: Inventory;

  farmAddress?: string;

  skills: {
    farming: Decimal;
    gathering: Decimal;
  };
};

export interface Context {
  state?: GameState;
  actions: PastAction[];
}
