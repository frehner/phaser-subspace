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

function preload() {
  this.load.spritesheet("ships", shipsImg, {frameWidth: 36})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()

  playerShip = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", 0)
  playerShip.setCollideWorldBounds(true)
  playerShip.setBounce(.1)
  rotationTime = 0
}

function update(time, delta) {
  let updateRotationTime = false

  if(cursors.left.isDown) {
    if(time > rotationTime) {
      const newFrame = playerShip.frame.name === 0 ? 39 : playerShip.frame.name - 1
      playerShip.setFrame(newFrame)
      updateRotationTime = true
    }
  } else if(cursors.right.isDown) {
    if(time > rotationTime) {
      const newFrame = playerShip.frame.name === 39 ? 0 : playerShip.frame.name + 1
      playerShip.setFrame(newFrame)
      updateRotationTime = true
    }
  } else {

  }

  if(updateRotationTime) {
    rotationTime = time + 35
  }
}