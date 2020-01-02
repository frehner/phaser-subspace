import {baseShip, SHIP_FRAME_WIDTH, BULLET_FRAME_WIDTH} from "./ships/baseShip"
import "./index.css"
import shipsImg from "../assets/ships.png"
import bulletsImg from "../assets/bullets.png"
import mapSprites from "../assets/map/mapsprites.png"
import tilemap from "../assets/map/testmap1.json"

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
let shipConfigObj, cursors, worldLayer

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
  shipConfigObj = new baseShip({shipIndex: 0, createContext: this, worldLayer})

  // camera follows this ship (put this here instead of the baseShip because the camera won't follow all ships created in the future)
  const camera = this.cameras.main
  camera.startFollow(shipConfigObj.ship)
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
}

function update(time, delta) {
  shipConfigObj.updateLoop({time, delta, updateContext: this, cursors, worldLayer})
}