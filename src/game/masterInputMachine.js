import {
  Machine,
  assign,
  spawn,
  interpret,
  forwardTo
} from "xstate/dist/xstate.web";
import { startMenuMachine } from "../startMenu/startMenuMachine.js";
import { createPlayGameMachine } from "../ships/newShipStateMachine";

export function createMasterInputService({
  createContext,
  worldLayer,
  map
} = {}) {
  const machine = Machine({
    id: "masterInput",
    initial: "startMenu",
    context: {
      userData: null,
      playGameMachine: null
    },
    states: {
      startMenu: {
        invoke: {
          src: startMenuMachine,
          id: "startMenuMachineId",
          onDone: "playGame",
          autoForward: true
        },
        on: {
          ESCAPE_KEY: "playGame"
        }
      },
      playGame: {
        entry: assign({
          playGameMachine: ctx =>
            ctx.playGameMachine ||
            spawn(
              createPlayGameMachine({ createContext, worldLayer, map }),
              "playGameMachineId"
            )
        }),
        on: {
          ESCAPE_KEY: "startMenu",
          "*": {
            actions: forwardTo("playGameMachineId")
          }
        }
      }
    }
  });

  return interpret(machine).start();
}
