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
      // Check the chargeElement is not already fully allocated
      if (chargeElement.billableAnnualQuantity < chargeElement.authorisedAnnualQuantity) {
        // Check if the return's purpose and abstraction period match the charge element
        if (_matchReturnToElement(returnData.metadata, chargeElement)) {
          // Calculate how much is left to allocated to the ChargeElement from the return
          let volumeLeftToAllocate = chargeElement.authorisedAnnualQuantity - chargeElement.billableAnnualQuantity
          // Check for the case that the return does not cover the full allocation
          if (returnVolumeInMegalitres < volumeLeftToAllocate) {
            volumeLeftToAllocate = returnVolumeInMegalitres
          }

          chargeElement.billableAnnualQuantity += volumeLeftToAllocate
          returnVolumeInMegalitres -= volumeLeftToAllocate
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
  return (
    returnMetadata.purposes[0].tertiary.code === chargeElement.purpose.legacyId &&
    returnMetadata.nald.periodStartDay === chargeElement.abstractionPeriodStartDay.toString() &&
    returnMetadata.nald.periodStartMonth === chargeElement.abstractionPeriodStartMonth.toString() &&
    returnMetadata.nald.periodEndDay === chargeElement.abstractionPeriodEndDay.toString() &&
    returnMetadata.nald.periodEndMonth === chargeElement.abstractionPeriodEndMonth.toString()
  )
}

module.exports = {
  go
}
