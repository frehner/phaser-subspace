import {Machine} from "xstate/dist/xstate.web"
import {thrustStates, thrustOptions} from './thrustStateMachineHelper'
import {weaponStates, weaponOptions} from "./weaponStateMachineHelper"
import {rotationStates} from "./rotationStateMachineHelper"
import {ALL_SHIPS_SPECS} from "./baseShip.js"

export function createPlayGameMachine({shipIndex=0, createContext, worldLayer} = {}) {
  const shipSpecs = ALL_SHIPS_SPECS[shipIndex]
  const ship = createContext.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", shipSpecs.frame.startIndex)

  return Machine({
    id: "playGameMachine",
    initial: "dead",
    context: {
      ship,
    },
    states: {
      dead: {
        entry: ["setShipToDead"],
        exit: ["setShipToAlive"],
        after: {
          3000: "flying"
        },
      },
      flying: {
        // main game
        on: {
          SHIP_DESTROYED: "dead",
          SHIP_ATTACHED: "attached",
        },
        type: 'parallel',
        states: {
          ...thrustStates,
          ...weaponStates,
          ...rotationStates,
        },
      },
      attached: {
        on: {
          DETATCH: "flying",
          ATTACHED_SHIP_DESTROYED: "dead"
        },
        type: 'parallel',
        states: {
          ...weaponStates,
          ...rotationStates,
        },
      }
    }
  }, {
    guards: {
      ...thrustOptions.guards,
      ...weaponOptions.guards,
    },
    actions: {
      setShipToDead: ctx => {
        ctx.ship.setVisible(false).setActive(false)
      },
      setShipToAlive: ctx => {
        ctx.ship.setVisible(true).setActive(true)
      }
    }
  })
}