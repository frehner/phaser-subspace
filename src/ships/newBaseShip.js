import {createShipStateMachine} from './shipStateMachine'

export const SHIP_FRAME_WIDTH = 36
export const BULLET_FRAME_WIDTH = 14

export function baseShip({shipIndex=0, createContext, worldLayer}) {
  const SHIP_SPECS = ALL_SHIPS_SPECS[shipIndex]

  const ship = createContext.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", SHIP_SPECS.frame.startIndex)
  // ship.setCollideWorldBounds(true)
  ship.setBounce(0)
  ship.setDepth(100)
  // ship collides with world
  createContext.physics.add.collider(ship, worldLayer)

  const shipStateMachine = createShipStateMachine(ship)
  const shipState = shipStateMachine.initialState

  const baseStats = {
    SHIP_SPECS,
    ship,
    shipStateMachine,
    shipState,
    rotationTime: 0,
    thrustBoostCharge: 100,
    weaponCharge: {
      level: 100,
      time: 0,
    }
  }

  return baseStats
}


const ALL_SHIPS_SPECS = {
  0: {
    frame: {
      width: 36,
      startIndex: 0,
      endIndex: 39,
    },
    thrust: {
      acceleration: 125,
      maxSpeed: 200,
      rotationDamper: 45, //higher damper means longer turn time
    },
    boostThrust: {
      acceleration: 250,
      maxSpeed: 350,
      chargeDamper: 16, //higher damper means longer charge time
    },
    weapon: {
      absoluteVelocity: 450,
      frame: 0,
      cost: 80,
      damage: 100,
      chargeDamper: 16, //higher damper means longer charge time
    },
  }
}