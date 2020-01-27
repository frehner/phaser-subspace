export const thrustStates = {
  thrust: {
    initial: "none",
    states: {
      none: {
        on: {
          NORMALTHRUST: "normal",
          BOOSTTHRUST: {
            target: "boost",
            cond: "thrustBoostHasCharge"
          },
        },
        entry: ["thrustNone"],
        activities: ["thrustCharge"],
      },
      normal: {
        on: {
          NOTHRUST: "none",
          BOOSTTHRUST: {
            target: "boost",
            cond: "thrustBoostHasCharge"
          },
        },
        activities: ["thrustNormal", "thrustCharge"],
      },
      boost: {
        on: {
          NOTHRUST: "none",
          NORMALTHRUST: "normal"
        },
        activities: ["thrustNormal", "thrustDrain"],
      }
    }
  },
}

export const thrustOptions = {
  guards: {
    thrustBoostHasCharge: context => context.ship.thrustBoostCharge >= context.ship.SHIP_SPECS.boostThrust.chargeDamper
  }
}