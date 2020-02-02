import {assign} from "xstate/dist/xstate.web"
import {SHIP_FRAME_WIDTH} from "./baseShip.js"

export const weaponStates = {
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
          GAMETICK: {
            actions: ["weaponsCharge"]
          }
        },
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

const guards = {
  weaponHasChargeToFire: context => context.weaponChargeLevel >= context.ship.__customAdditions__.SHIP_SPECS.weapon.cost
}

const actions = {
  weaponPrimaryFired: assign((context, action) => {
    const {radianFacing} = context.ship.__customAdditions__.getFacingData()
    const bullet = action.phaserUpdateContext.physics.add.sprite(
      context.ship.x + SHIP_FRAME_WIDTH / 2 * Math.cos(radianFacing),
      context.ship.y + SHIP_FRAME_WIDTH / 2 * -Math.sin(radianFacing),
      "bullets",
      context.ship.__customAdditions__.SHIP_SPECS.weapon.bulletFrame
    )
    bullet.setVelocity(
      Math.cos(radianFacing) * context.ship.__customAdditions__.SHIP_SPECS.weapon.absoluteVelocity + context.ship.body.velocity.x,
      // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
      -Math.sin(radianFacing) * context.ship.__customAdditions__.SHIP_SPECS.weapon.absoluteVelocity + context.ship.body.velocity.y,
    )

    // https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Factory.html#collider__anchor
    action.phaserUpdateContext.physics.add.collider(bullet, action.worldLayer, (collidedBullet, collidedWorldLayer) => {
      // https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Sprite.html#destroy__anchor
      collidedBullet.destroy()
    })

    return {
      weaponChargeLevel: context.weaponChargeLevel - context.ship.__customAdditions__.SHIP_SPECS.weapon.cost
    }
  }),

  weaponsCharge: assign((context, action) => {
    if(context.weaponChargeLevel === 100) return

    // TODO: update the weapon charge meter too

    // update the charge level independent of the framerate
    const fpLevel = action.delta / context.ship.__customAdditions__.SHIP_SPECS.weapon.chargeDamper
    const newLevel = Math.min(100, context.weaponChargeLevel + fpLevel)
    // this.weaponChargeLevelMeter.value = Math.floor(this.weaponCharge.level)
    return {
      weaponChargeLevel: newLevel
    }
  })
}

export const weaponOptions = {
  guards,
  actions,
}