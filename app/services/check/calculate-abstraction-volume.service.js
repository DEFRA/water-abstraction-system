'use strict'

/**
 * Used to calculate the abstraction volume for a return
 * @module CalculateAbstractionVolume
 */

function go (returns) {
  for (const returnData of returns) {
    if (returnData.versions[0]?.nilReturn === true) {
      returnData.volume = 0
    }

    if (!returnData.versions[0]?.lines) {
      continue
    }

    const totalQuantity = returnData.versions[0].lines.reduce((accumulator, line) => {
      if (line && line.quantity !== null) {
        return accumulator + (line.quantity || 0)
      }
      return accumulator
    }, 0)

    returnData.volume = totalQuantity
  }
}

module.exports = {
  go
}
