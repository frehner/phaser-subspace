import {SHIP_FRAME_WIDTH} from "./baseShip.js"

export const thrustStates = {
  thrust: {
    initial: "none",
    states: {
      none: {
        on: {
          NORMALTHRUST: "normal",
          BOOSTTHRUST: {
            target: "boost",
            cond: "shipHasBoostToBoost"
          },
          GAMETICK: {
            actions: ["boostCharge", "thrustNone"],
          }
        },
      },
      normal: {
        on: {
          NOTHRUST: "none",
          BOOSTTHRUST: {
            target: "boost",
            cond: "shipHasBoostToBoost"
          },
          GAMETICK: {
            actions: ["thrustNormal", "boostCharge"],
          }
        },
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
        },
      }
    }
  },
}

const actions = {
  thrustBoost: (context, action) => {

  },
  thrustNormal: (context, action) => {
    console.log('thrustnormal')
    const {radianFacing, radianBackwards} = context.ship.__customAdditions__.getFacingData()
    const baseAcceleration = context.ship.__customAdditions__.SHIP_SPECS.thrust.acceleration
    const baseMaxSpeed = context.ship.__customAdditions__.SHIP_SPECS.thrust.maxSpeed

    const xAcceleration = Math.cos(radianFacing) * baseAcceleration * (action.thrustDirection === "BACKWARD" ? -1 : 1)
    const yAcceleration = Math.sin(radianFacing) * baseAcceleration * (action.thrustDirection === "BACKWARD" ? 1 : -1)
    context.ship.setAcceleration(xAcceleration, yAcceleration)
    context.ship.body.setMaxSpeed(baseMaxSpeed)
    const particles = action.phaserUpdateContext.add.particles('fire');

    particles.createEmitter({
      alpha: { start: 1, end: 0 },
      scale: { start: 0.2, end: 0.8 },
      speed: 20,
      angle: { min: -85, max: -95 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 50, max: 200 },
      blendMode: 'ADD',
      frequency: 110,
      maxParticles: 1,
      follow: context.ship,
      followOffset: {
        x: (SHIP_FRAME_WIDTH / 2 - 4) * Math.cos(radianBackwards),
        // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
        y: (SHIP_FRAME_WIDTH / 2 - 4) * -Math.sin(radianBackwards)
      }
    });
  },
  
  thrustNone: (context, action) => {
    context.ship.setAcceleration(0)
  }
}

const guards = {
  shipHasBoostToBoost: context => context.thrustBoostChargeLevel > 0,

}

export const thrustOptions = {
  actions,
  guards,
}