'use strict'

/**
 * Matches and allocates where applicable the abstracted volumes on the return log with the appropriate charge element
 * @module AllocateReturnsToLicenceService
 */

const { periodsOverlap } = require('../../../lib/general.lib.js')

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
async function go (licences) {
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

function _checkReturnForIssues (returnRecord) {
  if (returnRecord.nilReturn) {
    return true
  }

  if (returnRecord.underQuery) {
    return true
  }

  if (returnRecord.status !== 'completed') {
    return true
  }

  if (returnRecord.returnSubmissions.length === 0 || returnRecord.returnSubmissions[0].returnSubmissionLines.length === 0) {
    return true
  }

  return false
}

function _matchAndAllocate (chargeElement, returnLogs, chargePeriod, chargeReference) {
  const matchedReturns = _matchReturns(chargeElement, returnLogs)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      allocatedQuantity: 0,
      returnId: matchedReturn.id,
      reviewReturnResultId: matchedReturn.reviewReturnResultId
    }

    chargeElement.returnLogs.push(matchedReturnResult)
    matchedReturn.matched = true

    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity && chargeReference.allocatedQuantity < chargeReference.volume) {
      if (_checkReturnForIssues(matchedReturn)) {
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
          matchedReturnResult.allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
          chargeReference.allocatedQuantity += qtyToAllocate
        }
      })
    }
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

function _matchReturns (chargeElement, returnLogs) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriods = chargeElement.abstractionPeriods

  return returnLogs.filter((record) => {
    const returnPeriods = record.abstractionPeriods

    const matchFound = record.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    if (!matchFound) {
      return false
    }

    return periodsOverlap(elementPeriods, returnPeriods)
  })
}

module.exports = {
  go
}
