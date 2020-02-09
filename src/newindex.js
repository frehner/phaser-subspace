import {createMasterInputService} from './game/masterInputMachine.js'
import {SHIP_FRAME_WIDTH, BULLET_FRAME_WIDTH} from "./ships/baseShip.js"
import "./index.css"
import shipsImg from "../assets/ships.png"
import bulletsImg from "../assets/bullets.png"
import mapSprites from "../assets/map/mapsprites.png"
import tilemap from "../assets/map/testmap.json"

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
let masterInputService, cursors, worldLayer, tempCounter

function preload() {
  this.load.spritesheet("ships", shipsImg, {frameWidth: SHIP_FRAME_WIDTH})
  this.load.spritesheet("bullets", bulletsImg, {frameWidth: BULLET_FRAME_WIDTH})
  this.load.image("mapsprites", mapSprites)
  this.load.tilemapTiledJSON("map", tilemap);
}

function create() {
  // map and world config
  // mostly following this guide https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
  const map = this.make.tilemap({key: "map"})
  const mapTileSet = map.addTilesetImage("mapsprites", "mapsprites")
  worldLayer = map.createStaticLayer("worldLayer", mapTileSet, 0, 0)
  worldLayer.setCollisionByProperty({collides: true})

  // debug world collisions to ensure they're configured correctly
  // const debugGraphics = this.add.graphics().setAlpha(0.75);
  // worldLayer.renderDebug(debugGraphics, {
  //   tileColor: null, // Color of non-colliding tiles
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  // });

  // cursors config
  cursors = this.input.keyboard.createCursorKeys()

  // ship config
  masterInputService = createMasterInputService({createContext: this, worldLayer, map})
  masterInputService.onTransition(state => {
    // console.log(state.value)
    // console.log("statechanged", state.event)
  })
}

function update(time, delta) {
  if(!tempCounter) {
    tempCounter = 1
    masterInputService.send("ESCAPE_KEY")
  }

  if(cursors.left.isDown || cursors.right.isDown) {
    masterInputService.send({
      type: "ROTATE",
      rotationDirection: cursors.left.isDown ? "LEFT" : "RIGHT",
      phaserUpdateContext: this,
      worldLayer,
      delta,
      time,
    })
  }

  if(cursors.space.isDown) {
    masterInputService.send({
      type: "PRIMARYWEAPON",
      phaserUpdateContext: this,
      worldLayer,
      delta,
      time,
    })
  }

  if(cursors.up.isDown || cursors.down.isDown) {
    masterInputService.send({
      type: cursors.shift.isDown ? "BOOSTTHRUST": "NORMALTHRUST",
      thrustDirection: cursors.up.isDown ? "FORWARD" : "BACKWARD",
      phaserUpdateContext: this,
      worldLayer,
      delta,
      time,
    })
  } else {
    masterInputService.send({
      type: "NOTHRUST",
      phaserUpdateContext: this,
      worldLayer,
      delta,
      time,
    })
  }

  masterInputService.send({
    type: "GAMETICK",
    time,
    delta,
    phaserUpdateContext: this,
  })
}
