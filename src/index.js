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
  acceleration: 125,
  frameStartIndex: 0,
  frameEndIndex: 39,
  maxSpeed: 200,
  rotationDamper: 45,
}

function preload() {
  this.load.spritesheet("ships", shipsImg, {frameWidth: 36})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()

  playerShip = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", 0)
  playerShip.setCollideWorldBounds(true)
  playerShip.setBounce(0)
  playerShip.setMaxVelocity(SHIP_DETAILS.maxSpeed)
  rotationTime = 0
}

function update(time, delta) {
  if(cursors.left.isDown || cursors.right.isDown) {
    if(time > rotationTime) {
      let newFrame = playerShip.frame.name + (cursors.left.isDown ? -1 : 1)
      if(newFrame < SHIP_DETAILS.frameStartIndex) {
        newFrame = SHIP_DETAILS.frameEndIndex
      } else if(newFrame > SHIP_DETAILS.frameEndIndex) {
        newFrame = SHIP_DETAILS.frameStartIndex
      }
      playerShip.setFrame(newFrame)
      rotationTime = time + SHIP_DETAILS.rotationDamper
    }
  }

  if(cursors.up.isDown || cursors.down.isDown) {
    // there are 40 different frames for each ship. 360deg / 40 = 9deg for a frame.
    // now to figure out how to add acceleration based on that. frame.name % 39 === direction facing
    const directionFacing = playerShip.frame.name % 39
    const degreeFacing = directionFacing * 9
    const radianFacing = Phaser.Math.DegToRad(degreeFacing)

    const xAcceleration = Math.sin(radianFacing) * SHIP_DETAILS.acceleration * (cursors.down.isDown ? -1 : 1)
    const yAcceleration = Math.cos(radianFacing) * SHIP_DETAILS.acceleration * (cursors.down.isDown ? 1 : -1)
    playerShip.setAcceleration(xAcceleration, yAcceleration)
  } else {
    playerShip.setAcceleration(0, 0)
  }
}