'use strict'

/**
 * Prepares the review return logs ready for presenting in the review page
 * @module PrepareReviewLicenceResultsService
 */

/**
 * Prepares the given review return logs, deduplicates them, and extracts matched and unmatched returns along with their
 * corresponding charge periods for the licence being reviewed
 *
 * @param {module:ReviewReturnResultModel} reviewReturnResults All the review return logs associated with the licence being reviewed
 *
 * @returns {Object[]} matched and unmatched return logs and the charge periods for that licence
 */
function go (reviewReturnResults) {
  const licenceRef = reviewReturnResults[0].licence.licenceRef
  const uniqueReturnLogs = _dedupeReturnLogs(reviewReturnResults)

  const { matchedReturns, unmatchedReturns } = _splitReturns(uniqueReturnLogs)

  // Only matched returns have a charge version and therefore chargePeriods
  const chargePeriods = _fetchChargePeriods(matchedReturns)

  return { matchedReturns, unmatchedReturns, chargePeriods, licenceRef }
}

function _dedupeReturnLogs (reviewReturnResults) {
  const uniqueReturnIds = new Set()
  const uniqueReturnLogs = []

  reviewReturnResults.forEach((returnLog) => {
    const id = returnLog.reviewReturnResultId

    if (!uniqueReturnIds.has(id)) {
      uniqueReturnIds.add(id)
      uniqueReturnLogs.push(returnLog)
    }
  })

  return uniqueReturnLogs
}

// To generate a list of charge periods from the return logs, we need to eliminate duplicate charge versions and extract
// unique charge periods based on their start and end dates.
function _fetchChargePeriods (matchedReturns) {
  const uniqueChargeVersionIds = new Set()
  const chargePeriods = []

  for (const returnLog of matchedReturns) {
    const id = returnLog.chargeVersionId

    if (!uniqueChargeVersionIds.has(id)) {
      uniqueChargeVersionIds.add(id)

      chargePeriods.push({
        startDate: returnLog.chargePeriodStartDate,
        endDate: returnLog.chargePeriodEndDate
      })
    }
  }

  return chargePeriods
}

function _splitReturns (uniqueReturnLogs) {
  // Filters the return logs to only return the ones where reviewChargeElementResultId exists (ie the return log
  // matches to a charge element)
  const matchedReturns = uniqueReturnLogs.filter((returnLog) => {
    return returnLog.reviewChargeElementResultId !== null
  })

  // Filters the return logs to only return the ones where reviewChargeElementResultId is null (ie the return log
  // does not match to a charge element)
  const unmatchedReturns = uniqueReturnLogs.filter((returnLog) => {
    return returnLog.reviewChargeElementResultId === null
  })

  return { matchedReturns, unmatchedReturns }
}

module.exports = {
  go
}
