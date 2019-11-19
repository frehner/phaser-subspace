import {Machine} from "xstate/dist/xstate.web"

const rotationStates = {
  rotation: {
    id: "rotation",
    initial: "none",
    states: {
      none: {
        on: {
          ROTATE: "rotate",
        }
      },
      rotate: {
        on: {
          NOROTATE: "none",
        }
      },
    }
  },
}

const thrustStates = {
  thrust: {
    initial: "none",
    states: {
      none: {
        on: {
          NORMALTHRUST: "normal",
          BOOSTTHRUST: "boost",
        },
      },
      normal: {
        on: {
          NOTHRUST: "none",
          BOOSTTHRUST: "boost",
        }
      },
      boost: {
        on: {
          NOTHRUST: "none",
          NORMALTHRUST: "normal"
        }
      }
    }
  },
}

const weaponStates = {
  weapons: {
    initial: "pending",
    states: {
      pending: {
        on: {
          PRIMARYWEAPON: "primary",
          SECONDARYWEAPON: "secondary",
        }
      },
      primary: {
        on: {
          "": "pending"
        }
      },
      secondary: {
        on: {
          "": "pending"
        }
      },
    },
  }
}

const weaponOptions = {
  guards: {
    weaponFullyCharged: (context, event) => false
  }
}

const shipStateMachine = Machine(
  {
    id: "ship",
    type: "parallel",
    states: {
      ...weaponStates,
      ...thrustStates,
      ...rotationStates
    }
  },
  {
    guards: {
      ...weaponOptions.guards,
    }
  }
)

export function createShipStateMachine() {
  return shipStateMachine
}