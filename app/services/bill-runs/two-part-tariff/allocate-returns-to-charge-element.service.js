'use strict'

/**
 * Allocates where applicable the abstracted volumes on the return log with the appropriate charge element
 * @module AllocateReturnsToChargeElementService
 */

const { periodsOverlap } = require('../../../lib/general.lib.js')

/**
 * For a chargeElement with matching returns any abstracted volume recorded on the return log will be allocated to the
 * charge element up to a maximum of the charge elements authorised volume, or the remaining authorised volume on the
 * charge reference, whichever is lower.
 *
 * @param {module:ChargeElementModel} chargeElement - The charge element to allocate return logs against
 * @param {module:ReturnLogModel[]} matchingReturns - Return logs that matched to the charge element
 * @param {module:ChargeVersionModel} chargePeriod - The charge period taken from the charge version
 * @param {module:ChargeReferenceModel} chargeReference - The charge reference the element belongs to
 */
function go (chargeElement, matchingReturns, chargePeriod, chargeReference) {
  matchingReturns.forEach((matchedReturn, i) => {
    // We don't allocate returns with issues
    if (matchedReturn.issues) {
      return
    }

    // We can only allocate up to the authorised volume on the charge reference, even if there is charge elements
    // unallocated and returns to be allocated
    if (chargeReference.allocatedQuantity >= chargeReference.volume) {
      return
    }

    // Finally, we can only allocate to the charge element if there is unallocated volume left!
    if (chargeElement.allocatedQuantity >= chargeElement.authorisedAnnualQuantity) {
      return
    }

    const matchedLines = _matchLines(chargeElement, matchedReturn.returnSubmissions[0].returnSubmissionLines)

    if (matchedLines.length > 0) {
      _allocateReturns(chargeElement, matchedReturn, chargePeriod, chargeReference, i, matchedLines)
    }
  })
}

function _allocateReturns (chargeElement, matchedReturn, chargePeriod, chargeReference, i, matchedLines) {
  matchedLines.forEach((matchedLine) => {
    const remainingAllocation = chargeElement.authorisedAnnualQuantity - chargeElement.allocatedQuantity
    if (remainingAllocation > 0) {
      // We default how much to allocate to what is unallocated on the line i.e. remaining >= line.unallocated
      let qtyToAllocate = matchedLine.unallocated

      // If what remains is actually less than the line we instead set qtyToAllocate to what remains. We check this
      // on both the chargeReference and the element
      const chargeReferenceRemainingAllocation = chargeReference.volume - chargeReference.allocatedQuantity

      if (qtyToAllocate > chargeReferenceRemainingAllocation) {
        qtyToAllocate = chargeReferenceRemainingAllocation
      } else if (remainingAllocation < matchedLine.unallocated) {
        qtyToAllocate = remainingAllocation
      }

      // We do this check to prevent overwriting the value with false once it's been set to true as it only requires
      // a single `matchedLine` to overlap the charge period
      if (!chargeElement.chargeDatesOverlap) {
        chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
      }

      chargeElement.allocatedQuantity += qtyToAllocate
      chargeElement.returnLogs[i].allocatedQuantity += qtyToAllocate

      matchedLine.unallocated -= qtyToAllocate
      matchedReturn.allocatedQuantity += qtyToAllocate
      chargeReference.allocatedQuantity += qtyToAllocate
    }
  })
}

function _chargeDatesOverlap (matchedLine, chargePeriod) {
  const { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate } = chargePeriod
  const { startDate: lineStartDate, endDate: lineEndDate } = matchedLine

  if (lineStartDate < chargePeriodEndDate && lineEndDate > chargePeriodEndDate) {
    return true
  }

  return (lineStartDate < chargePeriodStartDate && lineEndDate > chargePeriodStartDate)
}

function _matchLines (chargeElement, returnSubmissionLines) {
  return returnSubmissionLines.filter((returnSubmissionLine) => {
    if (returnSubmissionLine.unallocated === 0) {
      return false
    }

    const { startDate, endDate } = returnSubmissionLine
    return periodsOverlap(chargeElement.abstractionPeriods, [{ startDate, endDate }])
  })
}

module.exports = {
  go
}
