import {Machine} from "xstate/dist/xstate.web"

export {
  createShipStateMachine
}

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
            actions: ["weaponPrimaryFired"],
            cond: "weaponHasChargeToFire",
          },
          SECONDARYWEAPON: {
            target: "secondary",
            actions: ["weaponSecondaryFired"]
          },
        },
        activities: ["weaponsCharge"]
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
    weaponHasChargeToFire: context => context.ship.weaponCharge.level >= context.ship.SHIP_SPECS.weapon.cost
  }
}

const shipMockObjectForDataVizGraph = {
  weaponCharge: {
    level: 1
  },
  DETAILS: {
    weapon: {
      cost: 1
    }
  }
}

function createShipStateMachine(ship = shipMockObjectForDataVizGraph) {
  return Machine(
    {
      id: "ship",
      type: "parallel",
      context: {
        ship,
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

// createShipStateMachine()