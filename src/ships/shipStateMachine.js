import {Machine} from "xstate/dist/xstate.web"

const rotationStates = {
  rotation: {
    initial: "noRotation",
    states: {
      noRotation: {
        on: {
          ROTATE: {
            target:"rotate",
            actions: () => console.log('rotating'),
          }
        }
      },
      rotate: {
        on: {
          NOROTATION: "noRotation",
        }
      },
    }
  },
}

const thrustStates = {
  thrust: {
    initial: "noThrust",
    states: {
      noThrust: {
        on: {
          NORMALTHRUST: {
            target: "normalThrust",
            actions: () => console.log('thrusting')
          },
          BOOSTTHRUST: "boostThrust",
        },
      },
      normalThrust: {
        on: {
          NOTHRUST: "noThrust",
          BOOSTTHRUST: "boostThrust",
        }
      },
      boostThrust: {
        on: {
          NOTHRUST: "noThrust",
          NORMALTHRUST: "normalThrust"
        }
      }
    }
  },
}

const weaponStates = {
  weapons: {
    initial: "weaponsPending",
    states: {
      weaponsPending: {
        on: {
          FIRE_PRIMARY: "firePrimary",
          FIRE_SECONDARY: "fireSecondary",
        }
      },
      firePrimary: {
        on: {
          "": "weaponsPending"
        }
      },
      fireSecondary: {
        on: {
          "": "weaponsPending"
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

export function createShipStateMachine() {
  return Machine(
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

}