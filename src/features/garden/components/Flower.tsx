import React, { useContext, useEffect, useRef, useState } from "react";
import "./Flower.css";
import Spritesheet, {
  SpriteSheetInstance,
} from "components/animation/SpriteAnimator";

import Decimal from "decimal.js-light";

import flySheet from "assets/resources/tree/shake_flower-export.png";
import choppedSheet from "assets/resources/tree/chopped_sheet.png";
import pollinatedFlower from "assets/crops/sunflower/planted.png";
import honey from "assets/resources/honey.png";
import bee from "assets/animals/bee.png";

import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Context } from "features/game/GameProvider";
import classNames from "classnames";
import { useActor } from "@xstate/react";
import {
  canPollinate,
  HoneyAction,
  BEE_ERRORS,
  FLOWER_RECOVERY_SECONDS,
} from "features/game/events/harvestHoney";

import { getTimeLeft } from "lib/utils/time";
import { ProgressBar } from "components/ui/ProgressBar";
import { Label } from "components/ui/Label";
import { chopAudio, treeFallAudio } from "lib/utils/sfx";
import { HealthBar } from "components/ui/HealthBar";

const POPOVER_TIME_MS = 1000;
const HITS = 3;

interface Props {
  flowerIndex: number;
}

export const Flower: React.FC<Props> = ({ flowerIndex }) => {
  const { gameService, selectedItem } = useContext(Context);
  const [game] = useActor(gameService);

  const [showPopover, setShowPopover] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const [popover, setPopover] = useState<JSX.Element | null>();

  const [touchCount, setTouchCount] = useState(0);
  // When to hide the honey that pops out
  const [collecting, setCollecting] = useState(false);

  const beeRef = useRef<HTMLDivElement>(null);
  const flyGif = useRef<SpriteSheetInstance>();
  const pollinatedGif = useRef<SpriteSheetInstance>();

  // Reset the fly count when clicking outside of the component
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (beeRef.current && !beeRef.current.contains(event.target)) {
        setTouchCount(0);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const flower = game.context.state.flowers[flowerIndex];

  // Users will need to refresh to chop the tree again
  const pollinated = !canPollinate(flower);

  const displayPopover = async (element: JSX.Element) => {
    setPopover(element);
    setShowPopover(true);

    await new Promise((resolve) => setTimeout(resolve, POPOVER_TIME_MS));
    setShowPopover(false);
  };

  const fly = async () => {
    if (game.matches("readonly")) {
      flyGif.current?.goToAndPlay(0);
      return;
    }

    if (selectedItem !== "Bee") {
      return;
    }

    const beeAmount = game.context.state.inventory.Bee || new Decimal(0);
    if (beeAmount.lessThanOrEqualTo(0)) return;

    const isPlaying = flyGif.current?.getInfo("isPlaying");

    if (isPlaying) {
      return;
    }

    chopAudio.play();
    flyGif.current?.goToAndPlay(0);

    setTouchCount((count) => count + 1);

    // On third fly, chop
    if (touchCount > 0 && touchCount === HITS - 1) {
      pollinate();
      treeFallAudio.play();
      setTouchCount(0);
    }
  };

  const pollinate = async () => {
    setTouchCount(0);

    try {
      gameService.send("flower.pollinated", {
        index: flowerIndex,
        item: selectedItem,
      });
      setCollecting(true);
      pollinatedGif.current?.goToAndPlay(0);

      displayPopover(
        <div className="flex">
          <img src={honey} className="w-5 h-5 mr-2" />
          <span className="text-sm text-white text-shadow">{`+${flower.honey}`}</span>
        </div>
      );

      await new Promise((res) => setTimeout(res, 2000));
      setCollecting(false);
    } catch (e: any) {
      if (e.message === BEE_ERRORS.NO_BEES) {
        displayPopover(
          <div className="flex">
            <img src={bee} className="w-4 h-4 mr-2" />
            <span className="text-xs text-white text-shadow">No bees left</span>
          </div>
        );
        return;
      }

      displayPopover(
        <span className="text-xs text-white text-shadow">{e.message}</span>
      );
    }
  };

  const handleHover = () => {
    if (
      game.matches("readonly") ||
      (selectedItem === "Bee" && game.context.state.inventory.Bee?.gte(1))
    )
      return;
    beeRef.current?.classList["add"]("cursor-not-allowed");
    setShowLabel(true);
  };

  const handleMouseLeave = () => {
    if (
      game.matches("readonly") ||
      (selectedItem === "Bee" && game.context.state.inventory.Bee?.gte(1))
    )
      return;
    beeRef.current?.classList["remove"]("cursor-not-allowed");
    setShowLabel(false);
  };

  const timeLeft = getTimeLeft(flower.pollinatedAt, FLOWER_RECOVERY_SECONDS);
  const percentage = 100 - (timeLeft / FLOWER_RECOVERY_SECONDS) * 100;

  return (
    <div
      className="relative"
      style={{ height: "106px", left: "-38px", top: "-35px" }}
    >
      {!pollinated && (
        <div
          onMouseEnter={handleHover}
          onMouseLeave={handleMouseLeave}
          ref={beeRef}
          className="group cursor-pointer  w-full h-full"
          onClick={fly}
        >
          <Spritesheet
            className="group-hover:img-highlight pointer-events-none transform flower"
            style={{
              width: `${GRID_WIDTH_PX * 4}px`,
              // Line it up with the click area
              transform: `translateX(-${GRID_WIDTH_PX * 1.5}px)`,
              imageRendering: "pixelated",
            }}
            getInstance={(spritesheet) => {
              flyGif.current = spritesheet;
            }}
            image={flySheet}
            widthFrame={266}
            heightFrame={168}
            fps={24}
            steps={11}
            direction={`forward`}
            autoplay={false}
            loop={true}
            onLoopComplete={(spritesheet) => {
              spritesheet.pause();
            }}
          />
          <div
            className={`absolute bottom-8 -right-[1rem] transition pointer-events-none w-28 z-20 ${
              showLabel ? "opacity-100" : "opacity-0"
            }`}
          >
            <Label>Equip an Bee first</Label>
          </div>
        </div>
      )}

      <Spritesheet
        style={{
          width: `${GRID_WIDTH_PX * 2}px`,
          // Line it up with the click area
          transform: `translateX(-${GRID_WIDTH_PX * 2}px)`,
          opacity: collecting ? 1 : 0,
          transition: "opacity 0.2s ease-in",
          imageRendering: "pixelated",
        }}
        className="absolute bottom-0 pointer-events-none"
        getInstance={(spritesheet) => {
          pollinatedGif.current = spritesheet;
        }}
        image={choppedSheet}
        widthFrame={266}
        heightFrame={168}
        fps={22}
        steps={11}
        direction={`forward`}
        autoplay={false}
        loop={true}
        onLoopComplete={(spritesheet) => {
          spritesheet.pause();
        }}
      />

      {pollinated && (
        <>
          <img
            src={pollinatedFlower}
            className="absolute"
            style={{
              width: `${GRID_WIDTH_PX}px`,
              bottom: "9px",
            }}
          />
          <div className="absolute -bottom-3  left-0">
            <ProgressBar percentage={percentage} seconds={timeLeft} />
          </div>
        </>
      )}

      <div
        className={classNames(
          "transition-opacity pointer-events-none absolute top-1 -right-7 healthbar",
          {
            "opacity-100": touchCount > 0,
            "opacity-0": touchCount === 0,
          }
        )}
      >
        <HealthBar percentage={collecting ? 0 : 100 - (touchCount / 3) * 100} />
      </div>

      <div
        className={classNames(
          "transition-opacity absolute -bottom-5 w-40 -left-16 z-20 pointer-events-none",
          {
            "opacity-100": showPopover,
            "opacity-0": !showPopover,
          }
        )}
      >
        {popover}
      </div>
    </div>
  );
};
