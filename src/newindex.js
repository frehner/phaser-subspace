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
  for(let key in cursors) {
    mapKeyCodeToEventName(cursors[key])
  }

  // ship config
  // shipConfigObj = new baseShip({shipIndex: 0, createContext: this, worldLayer})
  masterInputService = createMasterInputService({createContext: this})
  masterInputService.onTransition(state => {
    // console.log(state.value)
    // console.log("statechanged", state.event)
  })

  // camera follows this ship (put this here instead of the baseShip because the camera won't follow all ships created in the future)
  // const camera = this.cameras.main
  // camera.startFollow(shipConfigObj.ship)
  // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
}

function update(time, delta) {
  if(!tempCounter) {
    tempCounter = 1
    masterInputService.send("ESCAPE_KEY")
  }

  for(let key in cursors) {
    if(cursors[key].isDown) {
      masterInputService.send({
        type: cursors[key].__additionalData__.eventName,
        phaserUpdateContext: this,
        worldLayer,
        delta,
        time,
        ...cursors[key].__additionalData__
      })
    }
  }

  masterInputService.send({type: "GAMETICK", time, delta})
}

function mapKeyCodeToEventName(keyObj) {
  const additionalDataObj = {}
  switch (keyObj.keyCode) {
    // up and down
    case 38:
    case 40:
      additionalDataObj.eventName = "NORMALTHRUST"
      break;

    // left and right
    case 37:
    case 39:
      additionalDataObj.eventName = "ROTATE"
      additionalDataObj.rotationDirection = keyObj.keyCode === 37 ? "LEFT" : "RIGHT"
      break;

    // space
    case 32:
      additionalDataObj.eventName = "PRIMARYWEAPON"
      break;

    case 16:
      additionalDataObj.eventName = ""
      break;

    default:
      throw Error("Key input not currently mapped")
  }

  if(!keyObj.__additionalData__) {
    keyObj.__additionalData__ = {}
  }

  keyObj.__additionalData__ = {
    ...additionalDataObj
  }
}