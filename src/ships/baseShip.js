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
  this.weaponCharge = {
    level: 100,
    time: 0,
  }

  this.createWeaponChargeLevelMeter()

  this.shipStateMachine = createShipStateMachine(this)
  this.shipState = this.shipStateMachine.initialState
}

baseShip.prototype.createWeaponChargeLevelMeter = function() {
  const weaponChargeContainer = document.createElement("div")
  weaponChargeContainer.innerText = "W: "
  this.weaponChargeLevelMeter = document.createElement("meter")
  this.weaponChargeLevelMeter.setAttribute("min", 0)
  this.weaponChargeLevelMeter.setAttribute("max", 100)
  this.weaponChargeLevelMeter.setAttribute("low", this.DETAILS.weapon.cost)
  this.weaponChargeLevelMeter.setAttribute("high", 99)
  this.weaponChargeLevelMeter.setAttribute("optimum", 100)
  weaponChargeContainer.appendChild(this.weaponChargeLevelMeter)
  document.querySelector(".game-meta-information").appendChild(weaponChargeContainer)
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

baseShip.prototype.addActionsAndActivities = function() {
  this.actionsToPerform.push(...this.shipState.actions)
  for(let activityName in this.shipState.activities) {
    if(this.shipState.activities[activityName]) {
      this.actionsToPerform.push(activityName)
    }
  }
}

baseShip.prototype.handleRotationInput = function({cursors, time}) {
  if(cursors.left.isDown || cursors.right.isDown) {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "ROTATE", direction: cursors.left.isDown ? "left" : "right"})
  } else {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "NOROTATE"})
  }

  if(this.shipState.changed) {
    this.addActionsAndActivities()
  }
}

baseShip.prototype.rotateRotate = function({time, cursors}) {
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
}

baseShip.prototype.thrustNormal = function({cursors, updateContext}) {
  const {radianFacing, radianBackwards} = this.getFacingData()
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
}

baseShip.prototype.thrustNone = function() {
  this.ship.setAcceleration(0, 0)
}

baseShip.prototype.handleThrustInput = function({cursors}) {
  if(cursors.up.isDown || cursors.down.isDown) {
    const type = `${cursors.shift.isDown ? "BOOST" : "NORMAL"}THRUST`
    this.shipState = this.shipStateMachine.transition(this.shipState, {type, direction: cursors.up.isDown ? "forward" : "backward"})
  } else {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "NOTHRUST"})
  }
  this.addActionsAndActivities()
}

baseShip.prototype.handleWeaponsInput = function({cursors}) {
  if(cursors.space.isDown) {
    this.shipState = this.shipStateMachine.transition(this.shipState, {type: "PRIMARYWEAPON"})
  }
  // since there's no else statement here that calls "transition" then we have to check that it COULD have been called, and if it was, did it change
  if(this.shipState.changed && cursors.space.isDown) {
    this.addActionsAndActivities()
  }
}

baseShip.prototype.weaponPrimaryFired = function({updateContext}) {
  const {radianFacing} = this.getFacingData()
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
  this.weaponCharge.level = this.weaponCharge.level - this.DETAILS.weapon.cost
}

baseShip.prototype.weaponsCharge = function({delta}) {
  // update the charge level independent of the framerate
  const newLevel = delta / this.DETAILS.weapon.chargeDamper
  this.weaponCharge.level = Math.min(100, this.weaponCharge.level + newLevel)
  this.weaponChargeLevelMeter.value = Math.floor(this.weaponCharge.level)
}

baseShip.prototype.updateLoop = function(params = {}) {
  this.actionsToPerform = []
  this.handleRotationInput.apply(this, arguments)
  this.handleThrustInput.apply(this, arguments)
  this.handleWeaponsInput.apply(this, arguments)

  if(this.actionsToPerform.length) {
    this.actionsToPerform.forEach(actionName => {
      this[actionName] && this[actionName].apply(this, arguments)
    })
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
      rotationDamper: 45, //higher damper means longer turn time
    },
    boostThrust: {
      acceleration: 250,
      maxSpeed: 350,
    },
    weapon: {
      absoluteVelocity: 450,
      frame: 0,
      cost: 80,
      damage: 100,
      chargeDamper: 16, //higher damper means longer charge time
    },
  }
}