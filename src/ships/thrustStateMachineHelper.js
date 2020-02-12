import { Machine, assign } from "xstate/dist/xstate.web";
import { SHIP_FRAME_WIDTH } from "./baseShip.js";

const actions = {
  thrustNormal: assign((context, action) => {
    const thrustDirection = action.thrustDirection || context.thrustDirection;
    handleThrust({
      context,
      action,
      typeOfThrust: "thrust",
      thrustDirection
    });
    return {
      thrustDirection
    };
  }),

  thrustBoost: assign((context, action) => {
    const thrustDirection = action.thrustDirection || context.thrustDirection;
    handleThrust({
      context,
      action,
      typeOfThrust: "boostThrust",
      thrustDirection
    });
    return {
      thrustDirection
    };
  }),

  thrustNone: (context, action) => {
    context.ship.setAcceleration(0);
  },

  boostDrain: assign((context, action) => {
    const drainLevel =
      action.delta /
      context.ship.__customAdditions__.SHIP_SPECS.boostThrust.chargeDamper;
    const newLevel = Math.max(0, context.thrustBoostChargeLevel - drainLevel);
    context.boostChargeLevelMeter.value = newLevel;
    return {
      thrustBoostChargeLevel: newLevel
    };
  }),

  boostCharge: assign((context, action) => {
    const chargeLevel =
      action.delta /
      context.ship.__customAdditions__.SHIP_SPECS.boostThrust.chargeDamper;
    const newLevel = Math.min(
      100,
      context.thrustBoostChargeLevel + chargeLevel
    );
    context.boostChargeLevelMeter.value = newLevel;
    return {
      thrustBoostChargeLevel: newLevel
    };
  })
};

const guards = {
  shipHasBoostToBoost: context => context.thrustBoostChargeLevel > 0
};

function createBoostChargeLevelMeter() {
  const boostChargeContainer = document.createElement("div");
  boostChargeContainer.innerText = "B: ";
  const boostChargeLevelMeter = document.createElement("meter");
  boostChargeLevelMeter.setAttribute("min", 0);
  boostChargeLevelMeter.setAttribute("max", 100);
  boostChargeLevelMeter.setAttribute("low", 33);
  boostChargeLevelMeter.setAttribute("high", 66);
  boostChargeLevelMeter.setAttribute("optimum", 100);
  boostChargeLevelMeter.value = 100; //default to max
  boostChargeContainer.appendChild(boostChargeLevelMeter);
  document
    .querySelector(".game-meta-information")
    .appendChild(boostChargeContainer);
  return boostChargeLevelMeter;
}

function handleThrust({ context, action, typeOfThrust, thrustDirection }) {
  const {
    radianFacing,
    radianBackwards
  } = context.ship.__customAdditions__.getFacingData();
  const acceleration =
    context.ship.__customAdditions__.SHIP_SPECS[typeOfThrust].acceleration;
  const maxSpeed =
    context.ship.__customAdditions__.SHIP_SPECS[typeOfThrust].maxSpeed;

  const xAcceleration =
    Math.cos(radianFacing) *
    acceleration *
    (thrustDirection === "BACKWARD" ? -1 : 1);
  const yAcceleration =
    Math.sin(radianFacing) *
    acceleration *
    (thrustDirection === "BACKWARD" ? 1 : -1);
  context.ship.setAcceleration(xAcceleration, yAcceleration);
  context.ship.body.setMaxSpeed(maxSpeed);
  const particles = action.phaserUpdateContext.add.particles("fire");

  particles.createEmitter({
    alpha: { start: 1, end: 0 },
    scale: { start: 0.2, end: 0.8 },
    speed: 20,
    angle: { min: -85, max: -95 },
    rotate: { min: -180, max: 180 },
    lifespan: { min: 50, max: 200 },
    blendMode: "ADD",
    frequency: 110,
    maxParticles: 1,
    follow: context.ship,
    followOffset: {
      x: (SHIP_FRAME_WIDTH / 2 - 4) * Math.cos(radianBackwards),
      // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
      y: (SHIP_FRAME_WIDTH / 2 - 4) * -Math.sin(radianBackwards)
    }
  });
}

export const thrustStateMachine = Machine(
  {
    initial: "setupContext",
    context: {},
    states: {
      setupContext: {
        // the hope is that this type of solution isn't necessary in the future. but it is for now: https://github.com/davidkpiano/xstate/issues/993
        entry: assign(context => {
          return {
            thrustBoostChargeLevel: 100,
            thrustDirection: null,
            boostChargeLevelMeter: createBoostChargeLevelMeter(),
            ship: {},
            ...context
          };
        }),
        on: {
          "": {
            target: "none"
          }
        }
      },
      none: {
        on: {
          NORMALTHRUST: "normal",
          BOOSTTHRUST: {
            target: "boost",
            cond: "shipHasBoostToBoost"
          },
          GAMETICK: {
            actions: ["boostCharge", "thrustNone"]
          }
        }
      },
      normal: {
        on: {
          NOTHRUST: "none",
          BOOSTTHRUST: {
            target: "boost",
            cond: "shipHasBoostToBoost"
          },
          GAMETICK: {
            actions: ["thrustNormal", "boostCharge"]
          }
        }
      },
      boost: {
        on: {
          NOTHRUST: "none",
          NORMALTHRUST: "normal",
          GAMETICK: [
            {
              actions: ["boostDrain", "thrustBoost"],
              cond: "shipHasBoostToBoost"
            },
            {
              target: "normal"
            }
          ]
        }
      }
    }
  },
  {
    actions,
    guards
  }
);
