import { assign } from "xstate/dist/xstate.web"

export const rotationStates = {
  rotation: {
    id: "rotation",
    initial: "none",
    states: {
      none: {
        on: {
          ROTATE: "rotate",
        },
        entry: () => console.log("no rotation")
      },
      rotate: {
        on: {
          "": "none",
        },
        entry: ["rotateShip"]
      },
    }
  },
}

const actions = {
  rotateShip: assign((context, action) => {
    if(action.time > context.nextRotationTime) {
      let newFrame = context.ship.frame.name + (action.rotationDirection === "LEFT" ? -1 : 1)
      if(newFrame < context.ship.__customAdditions__.SHIP_SPECS.frame.startIndex) {
        newFrame = context.ship.__customAdditions__.SHIP_SPECS.frame.endIndex
      } else if(newFrame > context.ship.__customAdditions__.SHIP_SPECS.frame.endIndex) {
        newFrame = context.ship.__customAdditions__.SHIP_SPECS.frame.startIndex
      }
      context.ship.setFrame(newFrame)

      return {
        nextRotationTime: action.time + context.ship.__customAdditions__.SHIP_SPECS.thrust.rotationDamper
      }
    }
  }),
}

export const rotationOptions = {
  actions,
}