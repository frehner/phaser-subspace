import Phaser from "phaser/dist/phaser-arcade-physics.min.js"
import {baseShip, SHIP_FRAME_WIDTH, BULLET_FRAME_WIDTH} from "./ships/baseShip"
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
let ship, cursors

function preload() {
  this.load.spritesheet("ships", shipsImg, {frameWidth: SHIP_FRAME_WIDTH})
  this.load.spritesheet("bullets", bulletsImg, {frameWidth: BULLET_FRAME_WIDTH})
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()
  ship = new baseShip({shipIndex: 0, createContext: this})
}

function update(time, delta) {
  ship.updateLoop({time, delta, updateContext: this, cursors})
}