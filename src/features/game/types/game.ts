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

export type Rock = {
  amount: Decimal;
  // Epoch time in milliseconds
  minedAt: number;
};

export type InventoryItemName =
  | CropName
  | SeedName
  | CraftableName
  | ResourceName
  | SkillName;

export type Inventory = Partial<Record<InventoryItemName, Decimal>>;

type PastAction = GameEvent & {
  createdAt: Date;
};

export type GameState = {
  id?: number;
  balance: Decimal;
  fields: Record<number, FieldItem>;

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
