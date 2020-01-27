export const rotationStates = {
  rotation: {
    id: "rotation",
    initial: "none",
    states: {
      none: {
        on: {
          ROTATE: "rotate",
        },
      },
      rotate: {
        on: {
          NOROTATE: "none",
        },
        activities: ["rotateRotate"]
      },
    }
  },
}