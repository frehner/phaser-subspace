import {Machine} from "xstate/dist/xstate.web"

export const startMenuMachine = Machine({
  id: "startMenuMachine",
  initial: "waitingForInput",
  states: {
    waitingForInput: {}
  }
})