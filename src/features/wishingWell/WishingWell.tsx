import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";

import { Context } from "features/game/GameProvider";

import wishingWell from "assets/buildings/wishing_well.png";
import icon from "assets/brand/icon.png";

import { WishingWellModal } from "./components/WishingWellModal";
import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Action } from "components/ui/Action";
import { wishingWellAudio } from "lib/utils/sfx";

export const WishingWell: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);
  const [isOpen, setIsOpen] = React.useState(false);

  const isNotReadOnly = !gameState.matches("readonly");

  const openWell = () => {
    if (isNotReadOnly) {
      wishingWellAudio.play();
      setIsOpen(true);
    } else {
      return;
    }
  };
  return (
    <div
      className="z-10 absolute"
      // TODO some sort of coordinate system
      style={{
        width: `${GRID_WIDTH_PX * 1.6}px`,
        left: `${GRID_WIDTH_PX * 10.4}px`,
        top: `${GRID_WIDTH_PX * -3}px`,
      }}
    >
      <div
        className={classNames({
          "cursor-pointer": isNotReadOnly,
          "hover:img-highlight": isNotReadOnly,
        })}
      >
        <img
          src={wishingWell}
          alt="market"
          onClick={openWell}
          className="w-full"
        />
        {isNotReadOnly && (
          <Action
            className="absolute -bottom-6 -left-3"
            text="Wish"
            icon={icon}
            onClick={openWell}
          />
        )}
      </div>

      <Modal centered show={isOpen} onHide={() => setIsOpen(false)}>
        <WishingWellModal
          key={isOpen ? "1" : "0"}
          onClose={() => setIsOpen(false)}
        />
      </Modal>
    </div>
  );
};
