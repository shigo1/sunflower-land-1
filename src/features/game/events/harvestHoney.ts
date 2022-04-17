import Decimal from "decimal.js-light";
import { GameState, Inventory, InventoryItemName, Flower } from "../types/game";

export enum BEE_ERRORS {
  MISSING_BEE = "No bee",
  NO_BEES = "No bees left",
  NO_FLOWER = "No flower",
  STILL_GROWING = "Flower is still growing",
}

// 2 hours
export const FLOWER_RECOVERY_SECONDS = 24 * 60 * 60;

export function canPollinate(flower: Flower, now: number = Date.now()) {
  return now - flower.pollinatedAt > FLOWER_RECOVERY_SECONDS * 1000;
}

type GetPollinatedAtAtgs = {
  inventory: Inventory;
  createdAt: number;
};

/**
 * Set a chopped in the past to make it replenish faster
 */
function getPollinatedAt({
  inventory,
  createdAt,
}: GetPollinatedAtAtgs): number {

  return createdAt;
}

/**
 * Returns the amount of bees required to get some honey
 */
function getRequiredBeeAmount(inventory: Inventory) {
  return new Decimal(1);
}

export type HoneyAction = {
  type: "flower.pollinated";
  index: number;
  item: InventoryItemName;
};

type Options = {
  state: GameState;
  action: HoneyAction;
  createdAt?: number;
};

export function getHoney({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  if (action.item !== "Bee") {
    throw new Error(BEE_ERRORS.MISSING_BEE);
  }

  const beeAmount = state.inventory.Bee || new Decimal(0);
  const requiredBees = getRequiredBeeAmount(state.inventory);
  if (beeAmount.lessThan(requiredBees)) {
    throw new Error(BEE_ERRORS.NO_BEES);
  }

  // flower action
  const flower = state.flowers[action.index];

  if (!flower) {
    throw new Error(BEE_ERRORS.NO_FLOWER);
  }

  if (!canPollinate(flower, createdAt)) {
    throw new Error(BEE_ERRORS.STILL_GROWING);
  }

  const honeyAmount = state.inventory.Honey || new Decimal(0);

  return {
    ...state,
    inventory: {
      ...state.inventory,
      Bee: beeAmount.sub(requiredBees),
      Honey: honeyAmount.add(flower.honey),
    },
    flowers: {
      ...state.flowers,
      [action.index]: {
        pollinatedAt: getPollinatedAt({
          createdAt,
          inventory: state.inventory,
        }),
        // Placeholder, random numbers generated on server side
        honey: new Decimal(2),
      },
    },
  };

}
