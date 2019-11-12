import {Machine} from "xstate"

const rotationStates = {
  rotation: {
    initial: "none",
    states: {
      none: {
        on: {
          ROTATE: "rotate",
        }
      },
      rotate: {
        on: {
          NONE: "none",
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
          NORMAL: "normal",
          BOOST: "boost",
        }
      },
      normal: {
        on: {
          NONE: "none",
          BOOST: "boost",
        }
      },
      boost: {
        on: {
          NONE: "none",
          NORMAL: "normal"
        }
      }
    }
  },
}

const weaponStates = {
  weapons: {
    initial: "charged",
    states: {
      '': [
        {target: "charged", cond: "weaponFullyCharged"},
        {target: "charging"},
      ],
      charged: {
        on: {
          FIRE_PRIMARY: "firePrimary",
          FIRE_SECONDARY: "fireSecondary",
        }
      },
      firePrimary: {
        on: {
          FIRE_PRIMARY: "firePrimary",
          FIRE_SECONDARY: "fireSecondary",
          CHARGING: "charging",
        }
      },
      fireSecondary: {
        on: {
          FIRE_PRIMARY: "firePrimary",
          FIRE_SECONDARY: "fireSecondary",
          CHARGING: "charging",
        }
      },
      charging: {
        on: {
          FIRE_PRIMARY: "firePrimary",
          FIRE_SECONDARY: "fireSecondary",
          CHARGED: "charged",
        }
      }
    },
  }
}

const weaponOptions = {
  guards: {
    weaponFullyCharged: (context, event) => false
  }
}

const shipMachine = Machine(
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