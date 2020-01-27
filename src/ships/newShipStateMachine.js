import {Machine} from "xstate/dist/xstate.web"

import {thrustStates, thrustOptions} from './thrustStateMachineHelper'
import {weaponStates, weaponOptions} from "./weaponStateMachineHelper"
import {rotationStates} from "./rotationStateMachineHelper"

export const playGameMachine = Machine({
  id: "playGameMachine",
  initial: "dead",
  context: {
    ship: {}
  },
  states: {
    dead: {
      after: {
        3000: "flying"
      },
      entry: () => {console.log('dead but respawning')}
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
  }
})

