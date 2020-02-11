import {Machine, assign} from "xstate/dist/xstate.web"
import {thrustStateMachine} from './thrustStateMachineHelper'
import {weaponStates, weaponOptions, createWeaponChargeLevelMeter} from "./weaponStateMachineHelper"
import {rotationStates, rotationOptions} from "./rotationStateMachineHelper"
import {ALL_SHIPS_SPECS} from "./baseShip.js"

export function createPlayGameMachine({shipIndex=0, createContext, worldLayer, map} = {}) {
  return Machine({
    id: "playGameMachine",
    initial: "dead",
    context: {
      ship: null,
      weaponChargeLevel: 100,
      nextRotationTime: 0,
      weaponChargeLevelMeter: null,
    },
    states: {
      dead: {
        entry: ["setShipToDead"],
        exit: ["setShipToAlive"],
        after: {
          1000: "flying"
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
          thrust: {
            invoke: {
              src: thrustStateMachine,
              id: "thrustMachineId",
              autoForward: true,
              data: {
                ship: context => context.ship
              }
            }
          },
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
      ...weaponOptions.guards,
      ...rotationOptions.guards,
    },
    actions: {
      setShipToDead: ctx => {
        if(ctx.ship) {
          ctx.ship.setVisible(false).setActive(false)
        }
      },

      setShipToAlive: assign(ctx => {
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

        // collides with the world and objects
        createContext.physics.add.collider(ship, worldLayer)

        // camera follows this ship
        const camera = createContext.cameras.main
        camera.startFollow(ship)
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

        ship.setVisible(true).setActive(true)
        return {
          ship,
          weaponChargeLevel: 100,
          weaponChargeLevelMeter,
        }
      }),

      ...weaponOptions.actions,
      ...rotationOptions.actions,
    },
  })
}