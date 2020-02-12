export const SHIP_FRAME_WIDTH = 36;
export const BULLET_FRAME_WIDTH = 14;

export const ALL_SHIPS_SPECS = {
  0: {
    frame: {
      width: 36,
      startIndex: 0,
      endIndex: 39
    },
    thrust: {
      acceleration: 125,
      maxSpeed: 200,
      rotationDamper: 45 //higher damper means longer turn time
    },
    boostThrust: {
      acceleration: 250,
      maxSpeed: 350,
      chargeDamper: 16 //higher damper means longer charge time
    },
    weapon: {
      absoluteVelocity: 450,
      frame: 0,
      cost: 80,
      damage: 100,
      chargeDamper: 16 //higher damper means longer charge time
    }
  }
};
