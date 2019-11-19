import Phaser from "phaser/dist/phaser-arcade-physics.min.js"
import {createShipStateMachine} from './shipStateMachine'

export const SHIP_FRAME_WIDTH = 36
export const BULLET_FRAME_WIDTH = 14
export function baseShip({shipIndex=0, createContext}) {
  this.DETAILS = ALL_SHIPS_CONFIG[shipIndex]

  this.ship = createContext.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", this.DETAILS.frame.startIndex)
  this.ship.setCollideWorldBounds(true)
  this.ship.setBounce(0)
  this.ship.setMaxVelocity(this.DETAILS.thrust.maxSpeed)
  this.ship.setDepth(100)

  this.rotationTime = 0

  this.shipStateMachine = createShipStateMachine(this.ship)
  this.shipState = this.shipStateMachine.initialState
}

baseShip.prototype.getFacingData = function() {
  // there are 40 different frames for each ship. 360deg / 40 = 9deg for a frame.
  const directionFacing = this.ship.frame.name % 40
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

baseShip.prototype.updateLoop = function({cursors, time, updateContext}) {
  const actions = []

  const {radianFacing, radianBackwards} = this.getFacingData()

  if(cursors.left.isDown || cursors.right.isDown) {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "ROTATE", direction: cursors.left.isDown ? "left" : "right"})
    if(time > this.rotationTime) {
      let newFrame = this.ship.frame.name + (cursors.left.isDown ? -1 : 1)
      if(newFrame < this.DETAILS.frame.startIndex) {
        newFrame = this.DETAILS.frame.endIndex
      } else if(newFrame > this.DETAILS.frame.endIndex) {
        newFrame = this.DETAILS.frame.startIndex
      }
      this.ship.setFrame(newFrame)
      this.rotationTime = time + this.DETAILS.thrust.rotationDamper
    }
  } else {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "NOROTATION"})
  }

  actions.push(...this.shipState.actions)

  if(cursors.up.isDown || cursors.down.isDown) {
    const type = cursors.shift.isDown ? "BOOSTTHRUST" : "NORMALTHRUST"
    this.shipState = this.shipStateMachine.transition(this.shipState, {type, direction: cursors.up.isDown ? "forward" : "backward"})

    const defaultOrBoost = cursors.shift.isDown ? "boostThrust" : "thrust"
    const baseAcceleration = this.DETAILS[defaultOrBoost].acceleration
    const baseMaxSpeed = this.DETAILS[defaultOrBoost].maxSpeed

    const xAcceleration = Math.cos(radianFacing) * baseAcceleration * (cursors.down.isDown ? -1 : 1)
    const yAcceleration = Math.sin(radianFacing) * baseAcceleration * (cursors.down.isDown ? 1 : -1)
    this.ship.setAcceleration(xAcceleration, yAcceleration)
    this.ship.setMaxVelocity(baseMaxSpeed)

    const particles = updateContext.add.particles('fire');

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
      follow: this.ship,
      followOffset: {
        x: (SHIP_FRAME_WIDTH / 2 - 4) * Math.cos(radianBackwards),
        // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
        y: (SHIP_FRAME_WIDTH / 2 - 4) * -Math.sin(radianBackwards)
      }
    });
  } else {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "NOTHRUST"})
    this.ship.setAcceleration(0, 0)
  }

  actions.push(...this.shipState.actions)

  if(cursors.space.isDown) {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "weapons.FIRE_PRIMARY"})
    const bullet = updateContext.physics.add.sprite(
      this.ship.x + SHIP_FRAME_WIDTH / 2 * Math.cos(radianFacing),
      this.ship.y + SHIP_FRAME_WIDTH / 2 * -Math.sin(radianFacing),
      "bullets",
      this.DETAILS.weapon.bulletFrame
    )
    bullet.setVelocity(
      Math.cos(radianFacing) * this.DETAILS.weapon.absoluteVelocity + this.ship.body.velocity.x,
      // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
      -Math.sin(radianFacing) * this.DETAILS.weapon.absoluteVelocity + this.ship.body.velocity.y,
    )
  } else {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "weapons.WEAPONS_PENDING"})
  }

  actions.push(...this.shipState.actions)

  if(actions.length) {
    console.log(actions)
  }
}

const ALL_SHIPS_CONFIG = {
  0: {
    frame: {
      width: 36,
      startIndex: 0,
      endIndex: 39,
    },
    thrust: {
      acceleration: 125,
      maxSpeed: 200,
      rotationDamper: 45,
    },
    boostThrust: {
      acceleration: 250,
      maxSpeed: 350,
    },
    weapon: {
      absoluteVelocity: 325,
      frame: 0,
    },
  }
}