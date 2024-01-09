'use strict'

/**
 * Matches and allocates where applicable the abstracted volumes on the return log with the appropriate charge element
 * @module AllocateReturnsToLicenceService
 */

const { periodsOverlap } = require('../../../lib/general.lib.js')
const MatchReturnsToChargeElementService = require('./match-returns-to-charge-element.service.js')

/**
 * For each licence the service attempts to match the return logs to the charge element(s). It does this by matching the
 * `elementCode` of the charge element with the return logs, also checking that the abstraction periods for both the
 * element and return log overlap.
 *
 * If a match is found any abstracted volume recorded on the return log will be allocated to the charge element up to a
 * maximum of the charge elements authorised volume, or the remaining authorised volume on the charge reference,
 * whichever is lower.
 *
 * @param {Object[]} licences - The licences, associated charging data, and return logs to process
 */
function go (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returnLogs } = licence

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          _matchAndAllocate(chargeElement, returnLogs, chargeVersion.chargePeriod, chargeReference)
        })
      })
    })
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

function _matchAndAllocate (chargeElement, returnLogs, chargePeriod, chargeReference) {
  const matchedReturns = MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

  if (matchedReturns.length === 0) {
    return
  }

  let i = 0
  matchedReturns.forEach((matchedReturn) => {
    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity && chargeReference.allocatedQuantity < chargeReference.volume) {
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

          chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
          chargeElement.allocatedQuantity += qtyToAllocate
          console.log('Charge Element :', chargeElement)
          console.log('Matched Return :', matchedReturn)
          chargeElement.returnLogs[i].allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
          chargeReference.allocatedQuantity += qtyToAllocate
        }
      })
    }
    i++
  })
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
