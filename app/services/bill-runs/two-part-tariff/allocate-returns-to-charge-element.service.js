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
 * @param {module:ChargeElementModel} chargeElement - The charge element to match return logs against
 * @param {module:ReturnLogModel[]} matchingReturns - logs that matched the charge element
 * @param {module:ChargeVersionModel} chargePeriod - The charge period from the charge version the element belongs to
 * @param {module:ChargeReferenceModel} chargeReference - The charge reference the element belongs to
 */
function go (chargeElement, matchingReturns, chargePeriod, chargeReference) {
  _allocateReturns(chargeElement, matchingReturns, chargePeriod, chargeReference)
}

function _allocateReturns (chargeElement, matchingReturns, chargePeriod, chargeReference) {
  matchingReturns.forEach((matchedReturn, i) => {
    if (
      (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) &&
      (chargeReference.allocatedQuantity < chargeReference.volume)
    ) {
      if (matchedReturn.issues === true) {
        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn.returnSubmissions[0].returnSubmissionLines)

      if (matchedLines.length === 0) {
        return
      }

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
  })
}

function _chargeDatesOverlap (matchedLine, chargePeriod) {
  const { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate } = chargePeriod
  const { startDate: lineStartDate, endDate: lineEndDate } = matchedLine

  if (lineStartDate < chargePeriodEndDate && lineEndDate > chargePeriodEndDate) {
    return true
  }

  if (lineStartDate < chargePeriodStartDate && lineEndDate > chargePeriodStartDate) {
    return true
  }

  return false
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
