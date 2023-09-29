'use strict'

/**
 * Used to allocate the abstraction volumes to the charge elements
 * @module AllocateReturnsVolumes
 */

function go (chargeReference) {
  let returnVolumeInMegalitres
  // Loop through each return
  chargeReference.returns.forEach((returnData) => {
    // The volumes on the Return are in Cubic Metres so we convert to Megalitres to match the Charge Version data
    returnVolumeInMegalitres = returnData.volumes.total / 1000
    // Loop through each chargeElement
    chargeReference.chargeElements.forEach((chargeElement) => {
      // Match the Return's purpose to the chargeElements
      if (
        returnData.metadata.purposes[0].tertiary.code === chargeElement.purpose.legacyId &&
        returnData.metadata.nald.periodStartDay === chargeElement.abstractionPeriodStartDay.toString() &&
        returnData.metadata.nald.periodStartMonth === chargeElement.abstractionPeriodStartMonth.toString() &&
        returnData.metadata.nald.periodEndDay === chargeElement.abstractionPeriodEndDay.toString() &&
        returnData.metadata.nald.periodEndMonth === chargeElement.abstractionPeriodEndMonth.toString()
      ) {
        // Check to see if any of the return's volume can be allocated to the chargeElement
        if (chargeElement.billableAnnualQuantity < chargeElement.authorisedAnnualQuantity) {
          // Allocate all of the Return's volume to the element if possible
          if (
            (chargeElement.billableAnnualQuantity + returnVolumeInMegalitres) <= chargeElement.authorisedAnnualQuantity
          ) {
            chargeElement.billableAnnualQuantity = chargeElement.billableAnnualQuantity + returnVolumeInMegalitres
            returnVolumeInMegalitres = 0
          } else {
            // If not possible to add all the Return's volume add as much as possible up to the authorised amount
            const volumeToDeduct = chargeElement.authorisedAnnualQuantity - chargeElement.billableAnnualQuantity
            chargeElement.billableAnnualQuantity = chargeElement.authorisedAnnualQuantity
            // Update the volume remaining on the Return
            returnVolumeInMegalitres = returnVolumeInMegalitres - volumeToDeduct
          }
        }
      }
    })

    if (returnVolumeInMegalitres > 0) {
      // Convert any remaining volume back to Cubic Metres and add it to the volumes object
      returnData.volumes.unallocated = returnVolumeInMegalitres * 1000
    } else {
      returnData.volumes.unallocated = 0
    }
  })
}

module.exports = {
  go
}
