function baseShip(ship) {
  this.ship = ship
}

baseShip.prototype.DETAILS = {
  frame: {
    width: 36,
    startIndex: 0,
    endIndex: 39,
  },
  movement: {
    acceleration: 125,
    maxSpeed: 200,
    rotationDamper: 45,
  },
  boostMovement: {
    acceleration: 250,
    maxSpeed: 350,
  },
  weapon: {
    absoluteVelocity: 325,
    frame: 0,
  },
}

baseShip.prototype.createSetup = function() {
  this.ship.setCollideWorldBounds(true)
  this.ship.setBounce(0)
  this.ship.setMaxVelocity(this.DETAILS.movement.maxSpeed)
  this.ship.setDepth(100)
}

baseShip.prototype.getDirectionFacingData = function() {
  // this.ship
}