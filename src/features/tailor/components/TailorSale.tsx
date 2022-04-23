import React, { useContext, useState } from "react";

import close from "assets/icons/close.png";
import flag from "assets/nfts/flags/sunflower_flag.gif";

import { Panel } from "components/ui/Panel";
import { Tab } from "components/ui/Tab";
import { FLAGS } from "features/game/types/craftables";
import { Rare } from "features/blacksmith/components/Rare";
import { Flag } from "features/game/types/flags";
import { useActor } from "@xstate/react";
import { Context } from "features/game/GameProvider";

interface Props {
  onClose: () => void;
}

export const TailorSale: React.FC<Props> = ({ onClose }) => {
  const { gameService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const [tab, setTab] = useState<"flags">("flags");

  // Alphabetically sort the flags
  const sortedFlags = (Object.keys(FLAGS) as Flag[])
    .sort()
    .reduce((obj, key) => {
      obj[key] = FLAGS[key];
      return obj;
    }, {} as typeof FLAGS);

  const maxFlags =
    Object.values(FLAGS).filter((flag) => flag.name in state.inventory)
      .length === 3;

  return (
    <Panel className="pt-5 relative">
      <div className="flex justify-between absolute top-1.5 left-0.5 right-0 items-center">
        <div className="flex">
          <Tab isActive={tab === "flags"} onClick={() => setTab("flags")}>
            <img src={flag} className="h-5 mr-2" />
            <span className="text-sm text-shadow">Flags</span>
          </Tab>
        </div>
        <img
          src={close}
          className="h-6 cursor-pointer mr-2 mb-1"
          onClick={onClose}
        />
      </div>

      <div
        style={{
          minHeight: "200px",
        }}
      >
        <Rare
          items={sortedFlags}
          onClose={onClose}
          hasAccess={true}
          canCraft={!maxFlags}
        />
        <p className="text-xxs p-1 m-1 underline text-center">
          Max 3 flags per farm.
        </p>
      </div>
    </Panel>
  );
};
