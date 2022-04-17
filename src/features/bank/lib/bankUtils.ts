import { canChop } from "features/game/events/chop";
import { isSeed } from "features/game/events/plant";
import { FOODS } from "features/game/types/craftables";
import { SEEDS } from "features/game/types/crops";
import { GameState, Inventory, InventoryItemName } from "features/game/types/game";
import { SKILL_TREE } from "features/game/types/skills";

type CanWithdrawArgs = {
  item: InventoryItemName;
  game: GameState;
};

function cropIsPlanted({ item, game }: CanWithdrawArgs): boolean {
  const isPlanted = Object.values(game.fields).some((field) => field.name === item);
  return isPlanted
}

function hasSeeds(inventory: Inventory) {
  return Object.keys(inventory).some(name => name in SEEDS())
}

export function canWithdraw({ item, game }: CanWithdrawArgs) {
  // Coming soon
  if (isSeed(item)) {
    return false;
  }

  // Coming soon
  if (item in SKILL_TREE) {
    return false;
  }

  // Coming soon
  if (item in FOODS()) {
    return false;
  }

  // Make sure no trees are replenishing
  if (
    item === "Woody the Beaver" ||
    item === "Apprentice Beaver" ||
    item === "Foreman Beaver"
  ) {
    return Object.values(game.trees).every((tree) => canChop(tree));
  }

  if (item === 'Kuebiko' && hasSeeds(game.inventory)) {
    return false
  }

  // Make sure no crops are planted
  if (item === "Scarecrow" || item === "Nancy" || item === "Kuebiko") {
    return Object.values(game.fields).length === 0;
  }


  if (item === "Golden Cauliflower") {
    return !cropIsPlanted({ item: "Cauliflower", game });
  }

  if (item === "Mysterious Parsnip") {
    return !cropIsPlanted({ item: "Parsnip", game });
  }

  // Tools, Crops, Resources
  return true;
}
