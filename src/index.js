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
  this.load.spritesheet("ships", shipsImg, {frameWidth: 36})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()

  playerShip = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", SHIP_DETAILS.frameData.startIndex)
  playerShip.setCollideWorldBounds(true)
  playerShip.setBounce(0)
  playerShip.setMaxVelocity(SHIP_DETAILS.defaultStats.maxSpeed)
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
    // now to figure out how to add acceleration based on that. frame.name % 39 === direction facing
    const directionFacing = playerShip.frame.name % 39
    const degreeFacing = directionFacing * 9
    const radianFacing = Phaser.Math.DegToRad(degreeFacing)

    const defaultOrBoost = cursors.shift.isDown ? "boostStats" : "defaultStats"
    const baseAcceleration = SHIP_DETAILS[defaultOrBoost].acceleration
    const baseMaxSpeed = SHIP_DETAILS[defaultOrBoost].maxSpeed

    const xAcceleration = Math.sin(radianFacing) * baseAcceleration * (cursors.down.isDown ? -1 : 1)
    const yAcceleration = Math.cos(radianFacing) * baseAcceleration * (cursors.down.isDown ? 1 : -1)
    playerShip.setAcceleration(xAcceleration, yAcceleration)
    playerShip.setMaxVelocity(baseMaxSpeed)
  } else {
    playerShip.setAcceleration(0, 0)
  }
}