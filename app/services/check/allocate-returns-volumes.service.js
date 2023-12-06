'use strict'

/**
 * Used to allocate the abstraction volumes to the charge elements
 * @module AllocateReturnsVolumes
 */

function go (chargeReference) {
  let returnVolumeInMegalitres
  // Loop through each return log
  chargeReference.returnLogs.forEach((returnLogData) => {
    // The volumes on the return log are in Cubic Metres so we convert to Megalitres to match the charge version data
    returnVolumeInMegalitres = returnLogData.volumes.total / 1000
    // Loop through each charge element
    chargeReference.chargeElements.forEach((chargeElement) => {
      if (!chargeElement.allocatedReturnVolume) {
        chargeElement.allocatedReturnVolume = 0
      }
      // Check the chargeElement is not already fully allocated
      if (chargeElement.allocatedReturnVolume < chargeElement.authorisedAnnualQuantity) {
        // Check if the return log's purpose and abstraction period match the charge element
        if (_matchReturnToElement(returnLogData.metadata, chargeElement)) {
          // Calculate how much is left to allocated to the ChargeElement from the return
          let volumeLeftToAllocate = chargeElement.authorisedAnnualQuantity - chargeElement.allocatedReturnVolume
          // Check for the case that the return log does not cover the full allocation
          if (returnVolumeInMegalitres < volumeLeftToAllocate) {
            volumeLeftToAllocate = returnVolumeInMegalitres
          }

          chargeElement.allocatedReturnVolume += volumeLeftToAllocate
          returnVolumeInMegalitres -= volumeLeftToAllocate
        }
      }
    })

    if (returnVolumeInMegalitres > 0) {
      // Convert any remaining volume back to Cubic Metres and add it to the volumes object
      returnLogData.volumes.unallocated = returnVolumeInMegalitres * 1000
    } else {
      returnLogData.volumes.unallocated = 0
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
