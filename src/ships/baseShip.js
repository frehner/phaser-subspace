import {createShipStateMachine} from './shipStateMachine'

export const SHIP_FRAME_WIDTH = 36
export const BULLET_FRAME_WIDTH = 14
export function baseShip({shipIndex=0, createContext}) {
  this.SHIP_SPECS = ALL_SHIPS_SPECS[shipIndex]

  this.ship = createContext.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "ships", this.SHIP_SPECS.frame.startIndex)
  this.ship.setCollideWorldBounds(true)
  this.ship.setBounce(0)
  this.ship.setDepth(100)

  this.rotationTime = 0
  this.thrustBoostCharge = 100
  this.weaponCharge = {
    level: 100,
    time: 0,
  }

  this.createWeaponChargeLevelMeter()
  this.createThrustBoostLevelMeter()

  this.shipStateMachine = createShipStateMachine(this)
  this.shipState = this.shipStateMachine.initialState
}

baseShip.prototype.createWeaponChargeLevelMeter = function() {
  const weaponChargeContainer = document.createElement("div")
  weaponChargeContainer.innerText = "W: "
  this.weaponChargeLevelMeter = document.createElement("meter")
  this.weaponChargeLevelMeter.setAttribute("min", 0)
  this.weaponChargeLevelMeter.setAttribute("max", 100)
  this.weaponChargeLevelMeter.setAttribute("low", this.SHIP_SPECS.weapon.cost)
  this.weaponChargeLevelMeter.setAttribute("high", 99)
  this.weaponChargeLevelMeter.setAttribute("optimum", 100)
  weaponChargeContainer.appendChild(this.weaponChargeLevelMeter)
  document.querySelector(".game-meta-information").appendChild(weaponChargeContainer)
}

baseShip.prototype.createThrustBoostLevelMeter = function() {
  const thrustBoostContainer = document.createElement("div")
  thrustBoostContainer.innerText = "B: "
  this.thrustBoostChargeLevelMeter = document.createElement("meter")
  this.thrustBoostChargeLevelMeter.setAttribute("min", 0)
  this.thrustBoostChargeLevelMeter.setAttribute("max", 100)
  this.thrustBoostChargeLevelMeter.setAttribute("low", 33)
  this.thrustBoostChargeLevelMeter.setAttribute("high", 66)
  this.thrustBoostChargeLevelMeter.setAttribute("optimum", 100)
  thrustBoostContainer.appendChild(this.thrustBoostChargeLevelMeter)
  document.querySelector(".game-meta-information").appendChild(thrustBoostContainer)
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
    if(newFrame < this.SHIP_SPECS.frame.startIndex) {
      newFrame = this.SHIP_SPECS.frame.endIndex
    } else if(newFrame > this.SHIP_SPECS.frame.endIndex) {
      newFrame = this.SHIP_SPECS.frame.startIndex
    }
    this.ship.setFrame(newFrame)
    this.rotationTime = time + this.SHIP_SPECS.thrust.rotationDamper
  }
}

baseShip.prototype.thrustNormal = function({cursors, updateContext}) {
  const {radianFacing, radianBackwards} = this.getFacingData()
  const defaultOrBoost = (cursors.shift.isDown && this.thrustBoostCharge >= this.SHIP_SPECS.boostThrust.chargeDamper) ? "boostThrust" : "thrust"
  const baseAcceleration = this.SHIP_SPECS[defaultOrBoost].acceleration
  const baseMaxSpeed = this.SHIP_SPECS[defaultOrBoost].maxSpeed

  const xAcceleration = Math.cos(radianFacing) * baseAcceleration * (cursors.down.isDown ? -1 : 1)
  const yAcceleration = Math.sin(radianFacing) * baseAcceleration * (cursors.down.isDown ? 1 : -1)
  this.ship.setAcceleration(xAcceleration, yAcceleration)
  this.ship.setMaxVelocity(baseMaxSpeed)

  // https://www.html5gamedevs.com/topic/10401-is-there-a-way-to-set-maximum-speed-for-an-object/
  const {x: velocityX, y: velocityY} = this.ship.body.velocity
  const currentVelocitySquared = velocityX ** 2 + velocityY ** 2
  if(currentVelocitySquared > this.SHIP_SPECS[defaultOrBoost].maxSpeed ** 2) {
    const angle = Math.atan2(velocityY, velocityX)
    this.ship.setVelocity(
      Math.cos(angle) * this.SHIP_SPECS[defaultOrBoost].maxSpeed,
      Math.sin(angle) * this.SHIP_SPECS[defaultOrBoost].maxSpeed,
    )
  }

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

baseShip.prototype.thrustCharge = function({delta}) {
  // update the charge level independent of the framerate
  const newLevel = delta / this.SHIP_SPECS.boostThrust.chargeDamper
  this.thrustBoostCharge = Math.min(100, this.thrustBoostCharge + newLevel)
  this.thrustBoostChargeLevelMeter.value = Math.floor(this.thrustBoostCharge)
}

baseShip.prototype.thrustDrain = function({delta}) {
  const newLevel = delta / this.SHIP_SPECS.boostThrust.chargeDamper
  this.thrustBoostCharge = Math.max(0, this.thrustBoostCharge - newLevel)
  this.thrustBoostChargeLevelMeter.value = Math.floor(this.thrustBoostCharge)
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
    this.SHIP_SPECS.weapon.bulletFrame
  )
  bullet.setVelocity(
    Math.cos(radianFacing) * this.SHIP_SPECS.weapon.absoluteVelocity + this.ship.body.velocity.x,
    // you have to make sin negative for y because in cirlces, a positive y is up and negative y is down, whereas the opposite is true for canvas
    -Math.sin(radianFacing) * this.SHIP_SPECS.weapon.absoluteVelocity + this.ship.body.velocity.y,
  )
  this.weaponCharge.level = this.weaponCharge.level - this.SHIP_SPECS.weapon.cost
}

baseShip.prototype.weaponsCharge = function({delta}) {
  // update the charge level independent of the framerate
  const newLevel = delta / this.SHIP_SPECS.weapon.chargeDamper
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

const ALL_SHIPS_SPECS = {
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
      chargeDamper: 16, //higher damper means longer charge time
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