'use strict'

/**
 * Allocates where applicable the abstracted volumes on the return log with the appropriate charge element
 * @module AllocateReturnsToChargeElementService
 */

const Big = require('big.js')

const { periodsOverlap } = require('../../../lib/general.lib.js')

/**
 * For a chargeElement with matching returns any abstracted volume recorded on the return log will be allocated to the
 * charge element up to a maximum of the charge elements authorised volume, or the remaining authorised volume on the
 * charge reference, whichever is lower. If any "due" returns are matched to a charge element, that element will
 * have it's allocated volume increased to the authorised annual quantity or the references authorised annual quantity,
 * whichever is lower.
 *
 * @param {module:ChargeElementModel} chargeElement - The charge element to allocate return logs against
 * @param {module:ReturnLogModel[]} matchingReturns - Return logs that matched to the charge element
 * @param {module:ChargeVersionModel} chargePeriod - The charge period taken from the charge version
 * @param {module:ChargeReferenceModel} chargeReference - The charge reference the element belongs to
 */
function go (chargeElement, matchingReturns, chargePeriod, chargeReference) {
  _processCompletedReturns(chargeElement, matchingReturns, chargePeriod, chargeReference)

  const hasDueReturns = matchingReturns.some((matchedReturn) => {
    return matchedReturn.status === 'due'
  })

  // If there are due returns then we need to increase any matched references/elements to their authorised quantity
  if (hasDueReturns) {
    _processDueReturns(chargeElement, matchingReturns, chargeReference)
  }
}

function _allocateReturns (chargeElement, matchedReturn, chargePeriod, chargeReference, i, matchedLines) {
  matchedLines.forEach((matchedLine) => {
    const chargeElementRemainingAllocation = Big(chargeElement.authorisedAnnualQuantity)
      .minus(chargeElement.allocatedQuantity)
      .toNumber()
    const chargeReferenceRemainingAllocation = Big(chargeReference.volume)
      .minus(chargeReference.allocatedQuantity)
      .toNumber()

    const remainingAllocation = Math.min(chargeElementRemainingAllocation, chargeReferenceRemainingAllocation)

    if (remainingAllocation > 0) {
      let qtyToAllocate

      // If what remains to allocate on the charge reference/element is actually less than the `matchedLine.unallocated`
      // we set `qtyToAllocate` to what remains. Else the `qtyToAllocate` is equal to the `matchedLine.unallocated`.
      if (matchedLine.unallocated > remainingAllocation) {
        qtyToAllocate = remainingAllocation
      } else {
        qtyToAllocate = matchedLine.unallocated
      }

      // We do this check to prevent overwriting the value with false once it's been set to true as it only requires
      // a single `matchedLine` to overlap the charge period
      if (!chargeElement.chargeDatesOverlap) {
        chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
      }

      const lineWithinEndDate = _checkLineEndDate(matchedLine.endDate, chargeElement.abstractionPeriods)

      if (lineWithinEndDate) {
        chargeElement.allocatedQuantity = Big(chargeElement.allocatedQuantity).plus(qtyToAllocate).toNumber()
        chargeElement.returnLogs[i].allocatedQuantity = Big(chargeElement.returnLogs[i].allocatedQuantity)
          .plus(qtyToAllocate)
          .toNumber()
        matchedLine.unallocated = Big(matchedLine.unallocated).minus(qtyToAllocate).toNumber()
        matchedReturn.allocatedQuantity = Big(matchedReturn.allocatedQuantity).plus(qtyToAllocate).toNumber()
        chargeReference.allocatedQuantity = Big(chargeReference.allocatedQuantity).plus(qtyToAllocate).toNumber()
      }
    }
  })
}

function _allocateDueReturns (chargeElement, matchedReturn, chargeReference, i) {
  const chargeElementRemainingAllocation = Big(chargeElement.authorisedAnnualQuantity)
    .minus(chargeElement.allocatedQuantity)
    .toNumber()

  if (chargeElementRemainingAllocation > 0) {
    let qtyToAllocate = chargeElementRemainingAllocation

    // If the unallocated volume on the element is greater than that remaining on the reference the `qtyToAllocate` will
    // be set to whatever volume remains unallocated on the reference
    const chargeReferenceRemainingAllocation = Big(chargeReference.volume)
      .minus(chargeReference.allocatedQuantity)
      .toNumber()

    if (chargeElementRemainingAllocation > chargeReferenceRemainingAllocation) {
      qtyToAllocate = chargeReferenceRemainingAllocation
    }

    chargeElement.allocatedQuantity = Big(chargeElement.allocatedQuantity).plus(qtyToAllocate).toNumber()
    chargeElement.returnLogs[i].allocatedQuantity = Big(chargeElement.returnLogs[i].allocatedQuantity)
      .plus(qtyToAllocate)
      .toNumber()
    matchedReturn.allocatedQuantity = Big(matchedReturn.allocatedQuantity).plus(qtyToAllocate).toNumber()
    chargeReference.allocatedQuantity = Big(chargeReference.allocatedQuantity).plus(qtyToAllocate).toNumber()
  }
}

function _chargeDatesOverlap (matchedLine, chargePeriod) {
  const { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate } = chargePeriod
  const { startDate: lineStartDate, endDate: lineEndDate } = matchedLine

  if (lineStartDate < chargePeriodEndDate && lineEndDate > chargePeriodEndDate) {
    return true
  }

  return (lineStartDate < chargePeriodStartDate && lineEndDate > chargePeriodStartDate)
}

function _checkLineEndDate (lineEndDate, abstractionPeriods) {
  // If the endDate of the return submission line is after the end date of the charge elements abstraction period then
  // we do not want to allocate this. Here we are creating an array of the abstraction periods endDates (since there
  // can be more than 1), then by doing Math.max we can compare the end of the abstraction period to the end date of
  // the return submission line
  const abstractionPeriodsEndDates = abstractionPeriods.map((abstractionPeriod) => {
    return abstractionPeriod.endDate
  })

  const abstractionEndDate = new Date(Math.max(...abstractionPeriodsEndDates))

  return lineEndDate <= abstractionEndDate
}

function _fullyAllocated (chargeElement, chargeReference) {
  // We can only allocate up to the authorised volume on the charge reference, even if there is charge elements
  // unallocated and returns to be allocated
  if (chargeReference.allocatedQuantity >= chargeReference.volume) {
    return true
  }

  // Finally, we can only allocate to the charge element if there is unallocated volume left!
  return (chargeElement.allocatedQuantity >= chargeElement.authorisedAnnualQuantity)
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

/**
 * Checks a return record for potential issues based on specific criteria and flags it accordingly
 *
 * @private
 */
function _checkReturnForIssues (matchedReturn) {
  if (matchedReturn.nilReturn) {
    return true
  }

  if (matchedReturn.underQuery) {
    return true
  }

  if (matchedReturn.status !== 'completed') {
    return true
  }

  if (matchedReturn.returnSubmissions.length === 0 ||
    matchedReturn.returnSubmissions[0].returnSubmissionLines.length === 0) {
    return true
  }

  return false
}

function _processCompletedReturns (chargeElement, matchingReturns, chargePeriod, chargeReference) {
  matchingReturns.forEach((matchedReturn, i) => {
    // We don't allocate returns with issues
    if (_checkReturnForIssues(matchedReturn)) {
      return
    }

    // If the element/reference is fully allocated there is no further processing to do for the return
    if (_fullyAllocated(chargeElement, chargeReference)) {
      return
    }

    const matchedLines = _matchLines(chargeElement, matchedReturn.returnSubmissions[0].returnSubmissionLines)

    if (matchedLines.length > 0) {
      _allocateReturns(chargeElement, matchedReturn, chargePeriod, chargeReference, i, matchedLines)
    }
  })
}

function _processDueReturns (chargeElement, matchingReturns, chargeReference) {
  matchingReturns.forEach((matchedReturn, i) => {
    // We are only interested in due returns
    if (matchedReturn.status !== 'due') {
      return
    }

    // If the element/reference is fully allocated there is no further processing to do for the return
    if (_fullyAllocated(chargeElement, chargeReference)) {
      return
    }

    _allocateDueReturns(chargeElement, matchedReturn, chargeReference, i)
  })
}

module.exports = {
  go
}
