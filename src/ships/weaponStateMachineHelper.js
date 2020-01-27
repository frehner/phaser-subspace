export const weaponStates = {
  weapons: {
    initial: "pending",
    states: {
      pending: {
        on: {
          PRIMARYWEAPON: {
            target: "primary",
            actions: ["weaponPrimaryFired"],
            cond: "weaponHasChargeToFire",
          },
          SECONDARYWEAPON: {
            target: "secondary",
            actions: ["weaponSecondaryFired"]
          },
        },
        activities: ["weaponsCharge"]
      },
      primary: {
        on: {
          "": {
            target: "pending",
          }
        }
      },
      secondary: {
        on: {
          "": {
            target: "pending",
          }
        }
      },
    },
  }
}

export const weaponOptions = {
  guards: {
    weaponHasChargeToFire: context => context.ship.weaponCharge.level >= context.ship.SHIP_SPECS.weapon.cost
  }
}