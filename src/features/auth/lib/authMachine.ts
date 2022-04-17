import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { createMachine, Interpreter, assign } from "xstate";

import { metamask } from "../../../lib/blockchain/metamask";
import { createFarm as createFarmAction } from "../actions/createFarm";
import { login, Token, decodeToken } from "../actions/login";
import { oauthorise, redirectOAuth } from "../actions/oauth";
import { CharityAddress } from "../components/CreateFarm";

// Hashed eth 0 value
const INITIAL_SESSION =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const getFarmUrl = () => {
  const farmId = new URLSearchParams(window.location.search).get("farmId");

  return parseInt(farmId!);
};

const getDiscordCode = () => {
  const code = new URLSearchParams(window.location.search).get("code");

  return code;
};

const deleteFarmUrl = () =>
  window.history.pushState({}, "", window.location.pathname);

type Farm = {
  farmId: number;
  sessionId: string;
  address: string;
  createdAt: number;
};

export interface Context {
  errorCode?: keyof typeof ERRORS;
  farmId?: number;
  sessionId?: string;
  hash?: string;
  address?: string;
  token?: Token;
  rawToken?: string;
  captcha?: string;
}

type StartEvent = Farm & {
  type: "START_GAME";
};

type ExploreEvent = {
  type: "EXPLORE";
};

type VisitEvent = {
  type: "VISIT";
  farmId: number;
};

type ReturnEvent = {
  type: "RETURN";
};

type CreateFarmEvent = {
  type: "CREATE_FARM";
  charityAddress: CharityAddress;
  donation: number;
  captcha: string;
};

type LoadFarmEvent = {
  type: "LOAD_FARM";
};

export type BlockchainEvent =
  | StartEvent
  | ExploreEvent
  | VisitEvent
  | ReturnEvent
  | CreateFarmEvent
  | LoadFarmEvent
  | {
      type: "NETWORK_CHANGED";
    }
  | {
      type: "ACCOUNT_CHANGED";
    }
  | {
      type: "REFRESH";
    }
  | { type: "CONNECT_TO_DISCORD" };

export type BlockchainState = {
  value:
    | "visiting"
    | "minimised"
    | "connecting"
    | "connected"
    | "signing"
    | "oauthorising"
    | { connected: "loadingFarm" }
    | { connected: "farmLoaded" }
    | { connected: "checkingSupply" }
    | { connected: "supplyReached" }
    | { connected: "noFarmLoaded" }
    | { connected: "creatingFarm" }
    | { connected: "countdown" }
    | { connected: "readyToStart" }
    | { connected: "oauthorised" }
    | { connected: "authorised" }
    | "exploring"
    | "checkFarm"
    | "unauthorised";
  context: Context;
};

const API_URL = CONFIG.API_URL;

export type MachineInterpreter = Interpreter<
  Context,
  any,
  BlockchainEvent,
  BlockchainState
>;

export const authMachine = createMachine<
  Context,
  BlockchainEvent,
  BlockchainState
>(
  {
    id: "authMachine",
    initial: API_URL ? "connecting" : "visiting",
    context: {},
    states: {
      connecting: {
        id: "connecting",
        invoke: {
          src: "initMetamask",
          onDone: [
            // {
            //   target: "minimised",
            //   cond: () => !(window.screenTop === 0 && window.screenY === 0),
            // },
            {
              target: "checkFarm",
              cond: "hasFarmIdUrl",
            },
            {
              target: "oauthorising",
              cond: "hasDiscordCode",
            },
            { target: "signing" },
          ],
          onError: {
            target: "unauthorised",
            actions: "assignErrorMessage",
          },
        },
      },
      signing: {
        invoke: {
          src: "login",
          onDone: {
            target: "connected",
            actions: "assignToken",
          },
          onError: {
            target: "unauthorised",
            actions: "assignErrorMessage",
          },
        },
      },
      oauthorising: {
        invoke: {
          src: "oauthorise",
          onDone: {
            target: "connected.oauthorised",
            actions: "assignToken",
          },
          onError: {
            target: "unauthorised",
            actions: "assignErrorMessage",
          },
        },
      },
      connected: {
        initial: "loadingFarm",
        states: {
          loadingFarm: {
            id: "loadingFarm",
            invoke: {
              src: "loadFarm",
              onDone: [
                {
                  target: "countdown",
                  cond: "isFresh",
                },
                {
                  target: "readyToStart",
                  actions: "assignFarm",
                  cond: "hasFarm",
                },
                { target: "checkingSupply" },
              ],
              onError: {
                target: "#unauthorised",
                actions: "assignErrorMessage",
              },
            },
          },
          checkingSupply: {
            id: "checkingSupply",
            invoke: {
              src: async () => {
                const totalSupply = await metamask.getFarm()?.getTotalSupply();

                return {
                  totalSupply,
                };
              },
              onDone: [
                {
                  target: "noFarmLoaded",
                  cond: (_, event) => Number(event.data.totalSupply) < 100000,
                },
                { target: "supplyReached" },
              ],
              onError: {
                target: "#unauthorised",
                actions: "assignErrorMessage",
              },
            },
          },
          oauthorised: {
            on: {
              CREATE_FARM: {
                target: "creatingFarm",
              },
              REFRESH: {
                target: "#connecting",
              },
            },
          },
          creatingFarm: {
            invoke: {
              src: "createFarm",
              onDone: {
                target: "#connecting",
              },
              onError: {
                target: "#unauthorised",
                actions: "assignErrorMessage",
              },
            },
          },
          countdown: {
            on: {
              REFRESH: {
                target: "#connecting",
              },
            },
          },
          noFarmLoaded: {
            on: {
              CREATE_FARM: {
                target: "oauthorised",
              },
              CONNECT_TO_DISCORD: {
                // Redirects to Discord OAuth so no need for a state change
                target: "noFarmLoaded",
                actions: () => redirectOAuth(),
              },
              EXPLORE: {
                target: "#exploring",
              },
            },
          },
          farmLoaded: {
            always: {
              target: "readyToStart",
            },
          },
          readyToStart: {
            on: {
              START_GAME: {
                target: "authorised",
              },
              EXPLORE: {
                target: "#exploring",
              },
            },
          },
          authorised: {
            on: {
              REFRESH: {
                target: "#connecting",
              },
              EXPLORE: {
                target: "#exploring",
              },
            },
          },
          supplyReached: {},
        },
      },
      unauthorised: {
        id: "unauthorised",
      },
      exploring: {
        id: "exploring",
        on: {
          LOAD_FARM: {
            target: "#loadingFarm",
          },
          VISIT: {
            target: "checkFarm",
          },
        },
      },
      // An anonymous user is visiting a farm
      checkFarm: {
        invoke: {
          src: "visitFarm",
          onDone: {
            target: "visiting",
            actions: "assignFarm",
            cond: "hasFarm",
          },
          onError: {
            target: "unauthorised",
            actions: "assignErrorMessage",
          },
        },
      },
      visiting: {
        on: {
          RETURN: {
            target: "connecting",
            actions: ["resetFarm", "deleteFarmIdUrl"],
          },
        },
      },
      minimised: {},
    },
    on: {
      ACCOUNT_CHANGED: {
        target: "connecting",
        actions: "resetFarm",
      },
      NETWORK_CHANGED: {
        target: "connecting",
        actions: "resetFarm",
      },
      REFRESH: {
        target: "connecting",
        actions: "resetFarm",
      },
    },
  },
  {
    services: {
      initMetamask: async (): Promise<void> => {
        await metamask.initialise();
      },
      loadFarm: async (): Promise<Farm | undefined> => {
        const farmAccounts = await metamask.getFarm()?.getFarms();
        if (farmAccounts?.length === 0) {
          return;
        }

        const createdAt = await metamask
          .getBeta()
          ?.getCreatedAt(metamask.myAccount as string);

        // V1 just support 1 farm per account - in future let them choose between the NFTs they hold
        const farmAccount = farmAccounts[0];

        const sessionId = await metamask
          .getSessionManager()
          .getSessionId(farmAccount.tokenId);

        return {
          farmId: farmAccount.tokenId,
          address: farmAccount.account,
          sessionId,
          createdAt,
        };
      },
      createFarm: async (context: Context, event: any): Promise<Context> => {
        const { charityAddress, donation, captcha } = event as CreateFarmEvent;

        const newFarm = await createFarmAction({
          charity: charityAddress,
          donation,
          token: context.rawToken as string,
          captcha: captcha,
        });

        return {
          farmId: newFarm.tokenId,
          address: newFarm.account,
          sessionId: INITIAL_SESSION,
        };
      },
      login: async (): Promise<{ token: string }> => {
        const { token } = await login();

        return {
          token,
        };
      },
      oauthorise: async () => {
        const code = getDiscordCode() as string;
        // Navigates to Discord OAuth Flow
        const { token } = await oauthorise(code);

        return { token };
      },
      visitFarm: async (
        _context: Context,
        event: any
      ): Promise<Farm | undefined> => {
        const farmId = getFarmUrl() || (event as VisitEvent).farmId;
        const farmAccount = await metamask.getFarm()?.getFarm(farmId);

        return {
          farmId: farmAccount.tokenId,
          address: farmAccount.account,
          sessionId: "",
          createdAt: 0,
        };
      },
    },
    actions: {
      assignFarm: assign<Context, any>({
        farmId: (_context, event) => event.data.farmId,
        address: (_context, event) => event.data.address,
        sessionId: (_context, event) => event.data.sessionId,
      }),
      assignToken: assign<Context, any>({
        token: (_context, event) => decodeToken(event.data.token),
        rawToken: (_context, event) => event.data.token,
      }),
      assignErrorMessage: assign<Context, any>({
        errorCode: (_context, event) => event.data.message,
      }),
      resetFarm: assign<Context, any>({
        farmId: () => undefined,
        address: () => undefined,
        sessionId: () => undefined,
        token: () => undefined,
        rawToken: () => undefined,
      }),
      deleteFarmIdUrl: () => deleteFarmUrl(),
    },
    guards: {
      isFresh: (context: Context, event: any) => {
        if (!event.data?.farmId) {
          return false;
        }

        const secondsElapsed =
          Date.now() / 1000 - (event.data as Farm).createdAt;
        return secondsElapsed < 60;
      },
      hasFarm: (context: Context, event: any) => {
        // If coming from the loadingFarm transition the farmId with show up on the event
        // else we check for it on the context
        if (event.data?.farmId) {
          const { farmId } = event.data;

          return !!farmId;
        }

        return !!context.farmId;
      },
      hasFarmIdUrl: () => !isNaN(getFarmUrl()),
      hasDiscordCode: () => !!getDiscordCode(),
    },
  }
);
