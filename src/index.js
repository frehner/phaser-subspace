import Phaser from "phaser/dist/phaser-arcade-physics.min.js"
import "./index.css"
import shipsImg from "../assets/ships.png"

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
let playerShip, cursors, rotationTime
const FRAME_WIDTH = 36

const SHIP_DETAILS = {
  boostStats: {
    acceleration: 250,
    maxSpeed: 350,
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
  this.load.spritesheet("ships", shipsImg, {frameWidth: FRAME_WIDTH})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()

  playerShip = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", SHIP_DETAILS.frameData.startIndex)
  playerShip.setCollideWorldBounds(true)
  playerShip.setBounce(0)
  playerShip.setMaxVelocity(SHIP_DETAILS.defaultStats.maxSpeed)
  playerShip.setDepth(100)
  rotationTime = 0
}

function update(time, delta) {
  if(cursors.left.isDown || cursors.right.isDown) {
    if(time > rotationTime) {
      let newFrame = playerShip.frame.name + (cursors.left.isDown ? -1 : 1)
      if(newFrame < SHIP_DETAILS.frameData.startIndex) {
        newFrame = SHIP_DETAILS.frameData.endIndex
      } else if(newFrame > SHIP_DETAILS.frameData.endIndex) {
        newFrame = SHIP_DETAILS.frameData.startIndex
      }
      playerShip.setFrame(newFrame)
      rotationTime = time + SHIP_DETAILS.defaultStats.rotationDamper
    }
  }

  if(cursors.up.isDown || cursors.down.isDown) {
    // there are 40 different frames for each ship. 360deg / 40 = 9deg for a frame.
    const directionFacing = playerShip.frame.name % 40
    const degreeFacing = (-directionFacing + 90) * 9 % 360
    const radianFacing = Phaser.Math.DegToRad(degreeFacing)

    const degreeBackwards = (degreeFacing + 180) % 360
    const radianBackwards = Phaser.Math.DegToRad(degreeBackwards)

    const defaultOrBoost = cursors.shift.isDown ? "boostStats" : "defaultStats"
    const baseAcceleration = SHIP_DETAILS[defaultOrBoost].acceleration
    const baseMaxSpeed = SHIP_DETAILS[defaultOrBoost].maxSpeed

    const xAcceleration = Math.cos(radianFacing) * baseAcceleration * (cursors.down.isDown ? -1 : 1)
    const yAcceleration = Math.sin(radianFacing) * baseAcceleration * (cursors.down.isDown ? 1 : -1)
    playerShip.setAcceleration(xAcceleration, yAcceleration)
    playerShip.setMaxVelocity(baseMaxSpeed)

    const particles = this.add.particles('fire');

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
      x: playerShip.x + (FRAME_WIDTH / 2 - 4) * Math.cos(radianBackwards),
      y: playerShip.y + (FRAME_WIDTH / 2 - 4) * Math.sin(radianFacing),
    });

  } else {
    playerShip.setAcceleration(0, 0)
  }
}