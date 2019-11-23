import {Machine} from "xstate/dist/xstate.web"

const rotationStates = {
  rotation: {
    id: "rotation",
    initial: "none",
    states: {
      none: {
        on: {
          ROTATE: "rotate",
        },
      },
      rotate: {
        on: {
          NOROTATE: "none",
        },
        activities: ["rotateRotate"]
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
        entry: ["thrustNone"],
      },
      normal: {
        on: {
          NOTHRUST: "none",
          BOOSTTHRUST: "boost",
        },
        activities: ["thrustNormal"],
      },
      boost: {
        on: {
          NOTHRUST: "none",
          NORMALTHRUST: "normal"
        },
        activities: ["thrustNormal"],
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
          PRIMARYWEAPON: {
            target: "primary",
            actions: ["weaponPrimaryFired"]
          },
          SECONDARYWEAPON: {
            target: "secondary",
            actions: ["weaponSecondaryFired"]
          },
        }
      },
      primary: {
        on: {
          "": {
            target: "pending",
          }
        }
      },
      secondary: {
        on: {
          "": {
            target: "pending",
          }
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