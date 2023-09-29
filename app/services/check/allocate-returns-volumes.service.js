'use strict'

/**
 * Used to allocate the abstraction volumes to the charge elements
 * @module AllocateReturnsVolumes
 */

function go (chargeReference) {
  let returnVolumeInMegalitres
  // Loop through each return
  chargeReference.returns.forEach((returnData) => {
    // The volumes on the return are in Cubic Metres so we convert to Megalitres to match the charge version data
    returnVolumeInMegalitres = returnData.volumes.total / 1000
    // Loop through each charge element
    chargeReference.chargeElements.forEach((chargeElement) => {
      // Check if the return's purpose and abstraction period match the charge element
      if (_matchReturnToElement(returnData.metadata, chargeElement)) {
        // Check to see if any of the return's volume can be allocated to the charge element
        if (chargeElement.billableAnnualQuantity < chargeElement.authorisedAnnualQuantity) {
          // Allocate all of the return's volume to the charge element if possible
          if (
            (chargeElement.billableAnnualQuantity + returnVolumeInMegalitres) <= chargeElement.authorisedAnnualQuantity
          ) {
            chargeElement.billableAnnualQuantity = chargeElement.billableAnnualQuantity + returnVolumeInMegalitres
            returnVolumeInMegalitres = 0
          } else {
            // If not possible to add all the return's volume add as much as possible up to the authorised amount
            const volumeToDeduct = chargeElement.authorisedAnnualQuantity - chargeElement.billableAnnualQuantity
            chargeElement.billableAnnualQuantity = chargeElement.authorisedAnnualQuantity
            // Update the volume remaining on the return
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

function _matchReturnToElement (returnMetadata, chargeElement) {
  if (
    returnMetadata.purposes[0].tertiary.code === chargeElement.purpose.legacyId &&
    returnMetadata.nald.periodStartDay === chargeElement.abstractionPeriodStartDay.toString() &&
    returnMetadata.nald.periodStartMonth === chargeElement.abstractionPeriodStartMonth.toString() &&
    returnMetadata.nald.periodEndDay === chargeElement.abstractionPeriodEndDay.toString() &&
    returnMetadata.nald.periodEndMonth === chargeElement.abstractionPeriodEndMonth.toString()
  ) {
    return true
  }
}

module.exports = {
  go
}
