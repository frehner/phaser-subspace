import {Machine} from "xstate/dist/xstate.web"
const SHIP_DETAILS = {
  boostStats: {
    acceleration: 250,
    maxSpeed: 350,
  },
  weaponData: {
    absoluteVelocity: 325,
    // areaDamage: false,
    bulletFrame: 0,
    // damage: 100,
    // timesBounces: 0,
  },
  defaultStats: {
    acceleration: 125,
    maxSpeed: 200,
    rotationDamper: 45,
  },
  frameData: {
    startIndex: 0,
    endIndex: 39,
  },
}

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

export function createShipStateMachine(playerShip) {
  // some initial config
  playerShip.setCollideWorldBounds(true)
  playerShip.setBounce(0)
  playerShip.setMaxVelocity(SHIP_DETAILS.defaultStats.maxSpeed)
  playerShip.setDepth(100)

  return Machine(
    {
      id: "ship",
      type: "parallel",
      context: {
        playerShip,
        rotationTime: 0,
      },
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