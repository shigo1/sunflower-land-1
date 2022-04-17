import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";

import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Panel } from "components/ui/Panel";
import { roundToOneDecimal } from "features/auth/components";
import { metamask } from "lib/blockchain/metamask";
import { Button } from "components/ui/Button";

import begger from "assets/npcs/begger.gif";
import richBegger from "assets/npcs/rich_begger.gif";
import upArrow from "assets/icons/arrow_up.png";
import downArrow from "assets/icons/arrow_down.png";
import team from "assets/npcs/team.png";
import humanDeath from "assets/npcs/human_death.gif";
import { ERRORS } from "lib/errors";
import { beggarAudio } from "lib/utils/sfx";

type DonateEvent = {
  type: "DONATE";
  donation: number;
};

type Event = DonateEvent | { type: "BEGGER_CLICK" } | { type: "CLOSE" };

interface Context {
  hasDonated: boolean;
}

export type State = {
  value: "idle" | "begging" | "donating" | "donated" | "error";
  context: Context;
};

const teamDonationMachine = createMachine<Context, Event, State>({
  initial: "idle",
  context: {
    hasDonated: false,
  },
  states: {
    idle: {
      on: {
        BEGGER_CLICK: {
          target: "begging",
        },
      },
    },
    begging: {
      on: {
        DONATE: {
          target: "donating",
        },
        CLOSE: {
          target: "idle",
        },
      },
    },
    donating: {
      invoke: {
        src: async (_context: Context, event: any): Promise<void> => {
          const { donation } = event as DonateEvent;

          await metamask.donateToTheTeam(donation);
        },
        onDone: {
          target: "donated",
          actions: assign({ hasDonated: (_context, _event) => true }),
        },
        onError: [
          {
            target: "idle",
            cond: (_, event: any) =>
              event.data.message === ERRORS.REJECTED_TRANSACTION,
          },
          {
            target: "error",
          },
        ],
      },
    },
    donated: {
      after: {
        1000: {
          target: "idle",
        },
      },
    },
    error: {
      after: {
        2000: {
          target: "idle",
        },
      },
    },
  },
});

export const TeamDonation: React.FC = () => {
  const [state, send] = useMachine(teamDonationMachine);
  const [donation, setDonation] = useState(1);

  const onDonationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If keyboard input "" convert to 0
    // Typed input validation will happen in onBlur
    setDonation(roundToOneDecimal(Number(e.target.value)));
  };

  const incrementDonation = () => {
    setDonation((prevState) => roundToOneDecimal(prevState + 0.1));
  };

  const decrementDonation = () => {
    if (donation === 0.2) {
      setDonation(0.2);
    } else setDonation((prevState) => roundToOneDecimal(prevState - 0.1));
  };

  const beggarClick = () => {
    send("BEGGER_CLICK");
    beggarAudio.play();
  };
  return (
    <div
      className="z-5 absolute align-items-center w-[72px]"
      style={{
        left: `calc(50% - ${GRID_WIDTH_PX * -9.8}px)`,
        // trial and error
        top: `calc(50% - ${GRID_WIDTH_PX * 17.2}px)`,
      }}
    >
      {!state.context.hasDonated ? (
        <img
          id="begger"
          src={begger}
          className="absolute hover:cursor-pointer hover:img-highlight z-10"
          style={{
            width: `${GRID_WIDTH_PX * 1.8}px`,
          }}
          onClick={beggarClick}
        />
      ) : (
        <img
          id="rich_begger"
          src={richBegger}
          className="absolute hover:cursor-pointer hover:img-highlight z-10"
          style={{
            width: `${GRID_WIDTH_PX * 1.8}px`,
          }}
          onClick={beggarClick}
        />
      )}
      <Modal
        centered
        show={!state.matches("idle")}
        onHide={() => send("CLOSE")}
      >
        <Panel>
          {state.matches("begging") && (
            <div className="flex flex-col items-center mb-1">
              <img src={team} alt="sunflower token" className="w-full mb-3" />
              <div className="flex flex-col text-shadow items-center">
                <h2 className="text-sm sm:text-base mb-2 text-center pb-2">
                  Buy the team a coffee!
                </h2>
                <p className="sm:text-sm mb-3 text-center">
                  Sunflower Land is run by a small group of passionate
                  developers who are 100% sleep deprived.
                </p>
                <p className="sm:text-sm mb-3 text-center">
                  {`You can send us a donation of Matic with which we can drink
                more coffee and stay awake longer pumping out awesome new
                features`}
                </p>

                <p className="sm:text-sm  mb-3 text-center">
                  Every little bit counts!
                </p>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="text-shadow shadow-inner shadow-black bg-brown-200 w-24 p-1 text-center"
                  step="0.1"
                  min={0.1}
                  value={donation}
                  required
                  onChange={onDonationChange}
                  onBlur={() => {
                    if (donation < 0.1) setDonation(0.1);
                  }}
                />
                <img
                  src={upArrow}
                  alt="increment donation value"
                  className="cursor-pointer absolute -right-4 top-0"
                  onClick={incrementDonation}
                />
                <img
                  src={downArrow}
                  alt="decrement donation value"
                  className="cursor-pointer absolute -right-4 bottom-0"
                  onClick={decrementDonation}
                />
              </div>
              <span className="text-[10px] text-shadow mt-2 mb-3">
                Amount in MATIC
              </span>
              <div className="flex w-full">
                <Button className="w-full mr-1" onClick={() => send("CLOSE")}>
                  <span className="text-xs whitespace-nowrap">Close</span>
                </Button>
                <Button
                  className="w-full ml-1"
                  onClick={() => send("DONATE", { donation })}
                >
                  <span className="text-xs whitespace-nowrap">Donate</span>
                </Button>
              </div>
            </div>
          )}
          {state.matches("donating") && (
            <div className="flex flex-col items-center">
              <img id="begger" src={begger} className="w-24" />
              <p className="loading mb-4">Donating</p>
            </div>
          )}
          {state.matches("donated") && (
            <div className="flex flex-col items-center">
              <img id="richBegger" src={richBegger} className="w-24" />
              <p className="mb-4">Thank you!</p>
            </div>
          )}
          {state.matches("error") && (
            <div className="flex flex-col items-center">
              <img id="richBegger" src={humanDeath} />
              <p className="my-4">Oh no! Something went wrong!</p>
            </div>
          )}
        </Panel>
      </Modal>
    </div>
  );
};
