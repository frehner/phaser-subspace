import {Machine, assign, spawn, interpret, forwardTo} from "xstate/dist/xstate.web"

import {startMenuMachine} from "../startMenu/startMenuMachine.js"
import {playGameMachine} from "../ships/newShipStateMachine"
import { send } from "xstate"

export function createMasterInputService() {
  const machine = Machine({
    id: 'masterInput',
    initial: 'startMenu',
    context: {
      userData: null,
      playGameMachine: null,
    },
    states: {
      startMenu: {
        invoke: {
          src: startMenuMachine,
          onDone: 'playGame',
        },
        on: {
          ESCAPE_KEY: "playGame",
        }
      },
      playGame: {
        entry: assign({
          playGameMachine: ctx => ctx.playGameMachine || spawn(playGameMachine, "playGameMachineId"),
        }),
        on: {
          ESCAPE_KEY: "startMenu",
          "*": {
            actions: forwardTo("playGameMachineId")
          }
        }
      },
    }
  })

  return interpret(machine).start()
}