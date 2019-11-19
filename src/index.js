import Phaser from "phaser/dist/phaser-arcade-physics.min.js"
import {createShipStateMachine} from "./ship/state-machine"
import "./index.css"
import shipsImg from "../assets/ships.png"
import bulletsImg from "../assets/bullets.png"

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  }
}

const game = new Phaser.Game(config)
let shipMachine, cursors, shipState
const SHIP_FRAME_WIDTH = 36
const BULLET_FRAME_WIDTH = 14

const SHIP_DETAILS = {
  boostStats: {
    acceleration: 250,
    maxSpeed: 350,
  },
  weaponData: {
    absoluteVelocity: 325,
    // areaDamage: false,
    bulletFrame: 0,
    // damage: 100,
    // timesBounces: 0,
  },
  defaultStats: {
    acceleration: 125,
    maxSpeed: 200,
    rotationDamper: 45,
  },
  frameData: {
    startIndex: 0,
    endIndex: 39,
  },
}

function preload() {
  this.load.spritesheet("ships", shipsImg, {frameWidth: SHIP_FRAME_WIDTH})
  this.load.spritesheet("bullets", bulletsImg, {frameWidth: BULLET_FRAME_WIDTH})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()

  const playerShip = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", SHIP_DETAILS.frameData.startIndex)
  shipMachine = createShipStateMachine(playerShip)
  shipState = shipMachine.initialState
}

function update(time, delta) {
  // there are 40 different frames for each ship. 360deg / 40 = 9deg for a frame.
  // const directionFacing = playerShip.frame.name % 40
  // const degreeFacing = (-directionFacing + 90) * 9 % 360
  // const radianFacing = Phaser.Math.DegToRad(degreeFacing)

  // const degreeBackwards = (degreeFacing + 180) % 360
  // const radianBackwards = Phaser.Math.DegToRad(degreeBackwards)

  const actions = []

  if(cursors.left.isDown || cursors.right.isDown) {
    shipState = shipMachine.transition(shipState, {type: "ROTATE", direction: cursors.left.isDown ? "left" : "right"})
    // if(time > rotationTime) {
    //   let newFrame = playerShip.frame.name + (cursors.left.isDown ? -1 : 1)
    //   if(newFrame < SHIP_DETAILS.frameData.startIndex) {
    //     newFrame = SHIP_DETAILS.frameData.endIndex
    //   } else if(newFrame > SHIP_DETAILS.frameData.endIndex) {
    //     newFrame = SHIP_DETAILS.frameData.startIndex
    //   }
    //   playerShip.setFrame(newFrame)
    //   rotationTime = time + SHIP_DETAILS.defaultStats.rotationDamper
    // }
  } else {
    shipState = shipMachine.transition(shipState, {type: "NOROTATION"})
  }

  actions.push(...shipState.actions)

  if(cursors.up.isDown || cursors.down.isDown) {
    const type = cursors.shift.isDown ? "BOOSTTHRUST" : "NORMALTHRUST"
    shipState = shipMachine.transition(shipState, {type, direction: cursors.up.isDown ? "forward" : "backward"})

    // const defaultOrBoost = cursors.shift.isDown ? "boostStats" : "defaultStats"
    // const baseAcceleration = SHIP_DETAILS[defaultOrBoost].acceleration
    // const baseMaxSpeed = SHIP_DETAILS[defaultOrBoost].maxSpeed

    // const xAcceleration = Math.cos(radianFacing) * baseAcceleration * (cursors.down.isDown ? -1 : 1)
    // const yAcceleration = Math.sin(radianFacing) * baseAcceleration * (cursors.down.isDown ? 1 : -1)
    // playerShip.setAcceleration(xAcceleration, yAcceleration)
    // playerShip.setMaxVelocity(baseMaxSpeed)

    // const particles = this.add.particles('fire');

    // particles.createEmitter({
    //   alpha: { start: 1, end: 0 },
    //   scale: { start: 0.2, end: 0.8 },
    //   speed: 20,
    //   angle: { min: -85, max: -95 },
    //   rotate: { min: -180, max: 180 },
    //   lifespan: { min: 50, max: 200 },
    //   blendMode: 'ADD',
    //   frequency: 110,
    //   maxParticles: 1,
    //   follow: playerShip,
    //   followOffset: {
    //     x: (SHIP_FRAME_WIDTH / 2 - 4) * Math.cos(radianBackwards),
    //     // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
    //     y: (SHIP_FRAME_WIDTH / 2 - 4) * -Math.sin(radianBackwards)
    //   }
    // });
  } else {
    shipState = shipMachine.transition(shipState, {type: "NOTHRUST"})
    // playerShip.setAcceleration(0, 0)
  }

  actions.push(...shipState.actions)

  if(cursors.space.isDown) {
    shipState = shipMachine.transition(shipState, {type: "weapons.FIRE_PRIMARY"})
    // const bullet = this.physics.add.sprite(
    //   playerShip.x + SHIP_FRAME_WIDTH / 2 * Math.cos(radianFacing),
    //   playerShip.y + SHIP_FRAME_WIDTH / 2 * -Math.sin(radianFacing),
    //   "bullets",
    //   SHIP_DETAILS.weaponData.bulletFrame
    // )
    // bullet.setVelocity(
    //   Math.cos(radianFacing) * SHIP_DETAILS.weaponData.absoluteVelocity + playerShip.body.velocity.x,
    //   // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
    //   -Math.sin(radianFacing) * SHIP_DETAILS.weaponData.absoluteVelocity + playerShip.body.velocity.y,
    // )
  } else {
    shipState = shipMachine.transition(shipState, {type: "weapons.WEAPONS_PENDING"})
  }

  actions.push(...shipState.actions)

  if(actions.length) {
    console.log(actions)
  }

}