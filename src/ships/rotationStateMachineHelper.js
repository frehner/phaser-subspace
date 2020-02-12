import { Machine, assign } from "xstate/dist/xstate.web";

const actions = {
  rotateShip: assign((context, action) => {
    let newFrame =
      context.ship.frame.name + (action.rotationDirection === "LEFT" ? -1 : 1);
    if (
      newFrame < context.ship.__customAdditions__.SHIP_SPECS.frame.startIndex
    ) {
      newFrame = context.ship.__customAdditions__.SHIP_SPECS.frame.endIndex;
    } else if (
      newFrame > context.ship.__customAdditions__.SHIP_SPECS.frame.endIndex
    ) {
      newFrame = context.ship.__customAdditions__.SHIP_SPECS.frame.startIndex;
    }
    context.ship.setFrame(newFrame);

    return {
      nextRotationTime:
        action.time +
        context.ship.__customAdditions__.SHIP_SPECS.thrust.rotationDamper
    };
  })
};

const guards = {
  rotationTimeHasPassed: (context, action) =>
    action.time >= context.nextRotationTime
};

export const rotationStateMachine = Machine(
  {
    id: "rotation",
    initial: "setupContext",
    context: {},
    states: {
      setupContext: {
        entry: assign(context => {
          return {
            nextRotationTime: 0,
            ...context
          };
        }),
        on: {
          "": {
            target: "none"
          }
        }
      },
      none: {
        on: {
          ROTATE: {
            target: "rotate",
            cond: "rotationTimeHasPassed"
          }
        }
      },
      rotate: {
        on: {
          "": "none"
        },
        entry: ["rotateShip"]
      }
    }
  },
  {
    actions,
    guards
  }
);
