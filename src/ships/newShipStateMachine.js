import {Machine} from "xstate/dist/xstate.web"
import {thrustStates, thrustOptions} from './thrustStateMachineHelper'
import {weaponStates, weaponOptions, createWeaponChargeLevelMeter} from "./weaponStateMachineHelper"
import {rotationStates, rotationOptions} from "./rotationStateMachineHelper"
import {ALL_SHIPS_SPECS} from "./baseShip.js"

export function createPlayGameMachine({shipIndex=0, createContext, worldLayer} = {}) {
  const shipSpecs = ALL_SHIPS_SPECS[shipIndex]
  const ship = createContext.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", shipSpecs.frame.startIndex)

  ship.__customAdditions__ = {SHIP_SPECS: shipSpecs}
  ship.__customAdditions__.getFacingData = function() {
    // there are 40 different frames for each ship. 360deg / 40 = 9deg for a frame.
    const directionFacing = ship.frame.name % 40
    const degreeFacing = (-directionFacing + 90) * 9 % 360
    const radianFacing = Phaser.Math.DegToRad(degreeFacing)

    const degreeBackwards = (degreeFacing + 180) % 360
    const radianBackwards = Phaser.Math.DegToRad(degreeBackwards)

    return {
      degreeFacing,
      degreeBackwards,
      radianFacing,
      radianBackwards
    }
  }

  const weaponChargeLevelMeter = createWeaponChargeLevelMeter(ship)

  createContext.physics.add.collider(ship, worldLayer)

  return Machine({
    id: "playGameMachine",
    initial: "dead",
    context: {
      ship,
      weaponChargeLevel: 100,
      nextRotationTime: 0,
      weaponChargeLevelMeter,
      thrustBoostChargeLevel: 100,
    },
    states: {
      dead: {
        entry: ["setShipToDead"],
        exit: ["setShipToAlive"],
        after: {
          3000: "flying"
        },
      },
      flying: {
        // main game
        on: {
          SHIP_DESTROYED: "dead",
          SHIP_ATTACHED: "attached",
        },
        type: 'parallel',
        states: {
          ...thrustStates,
          ...weaponStates,
          ...rotationStates,
        },
      },
      attached: {
        // not implemented yet
        on: {
          DETATCH: "flying",
          ATTACHED_SHIP_DESTROYED: "dead"
        },
        type: 'parallel',
        states: {
          ...weaponStates,
          ...rotationStates,
        },
      }
    }
  }, {
    guards: {
      ...thrustOptions.guards,
      ...weaponOptions.guards,
      ...rotationOptions.guards,
    },
    actions: {
      setShipToDead: ctx => {
        ctx.ship.setVisible(false).setActive(false)
      },
      setShipToAlive: ctx => {
        ctx.ship.setVisible(true).setActive(true)
      },
      ...weaponOptions.actions,
      ...rotationOptions.actions,
      ...thrustOptions.actions,
    },
  })
}