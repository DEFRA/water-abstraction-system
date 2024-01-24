'use strict'

/**
 * Determines the issues on the licences for a two-part tariff bill run
 * @module DetermineBillRunIssuesService
 */

const FetchReviewResultsService = require('./fetch-review-results.service.js')

const READY = 'ready'
const REVIEW = 'review'

/**
 * Determines all the issues on the licences for a two-part tariff bill run
 *
 * @param {module:LicenceModel} licences the two-part tariff licence included in the bill run
 */
async function go (licences) {
  for (const licence of licences) {
    const licenceReviewResults = await FetchReviewResultsService.go(licence.licenceId)
    const { issues, status } = _determineIssues(licenceReviewResults)

    licence.issues = issues
    licence.status = status
  }
}

function _determineIssues (licenceReviewResults) {
  let status = READY
  const issues = []

  const abstractionOutsidePeriod = licenceReviewResults.some(licenceReviewResult => licenceReviewResult.reviewReturnResults?.abstractionOutsidePeriod)
  if (abstractionOutsidePeriod) {
    issues.push('Abstraction outside period')
  }

  const hasAggregate = licenceReviewResults.some(licenceReviewResult => licenceReviewResult.reviewChargeElementResults?.aggregate !== 1)
  if (hasAggregate) {
    issues.push('Aggregate factor')
    status = REVIEW
  }

  const underQuery = licenceReviewResults.some(licenceReviewResult => licenceReviewResult.reviewReturnResults?.underQuery)
  if (underQuery) {
    issues.push('Checking query')
    status = REVIEW
  }

  const noReturnsReceived = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturnResults?.status === 'due' || 'overdue'
  })
  if (noReturnsReceived) {
    issues.push('No returns received')
  }

  const overAbstracted = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturnResults?.quantity > licenceReviewResult.reviewReturnResults?.allocated
  })
  if (overAbstracted) {
    issues.push('Over abstraction')
  }

  const hasChargeDatesOverlap = licenceReviewResults.some(licenceReviewResult => licenceReviewResult.reviewChargeElementResults?.chargeDatesOverlap)
  if (hasChargeDatesOverlap) {
    issues.push('Overlap of charge dates')
    status = REVIEW
  }

  const notProcessed = licenceReviewResults.some(licenceReviewResult => licenceReviewResult.reviewReturnResults?.status === 'received')
  if (notProcessed) {
    issues.push('Returns received but not processed')
    status = REVIEW
  }

  const receivedLate = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturnResults?.receivedDate > licenceReviewResult.reviewReturnResults?.dueDate
  })
  if (receivedLate) {
    issues.push('Returns received late')
  }

  const returnsSplitOverChargeReference = _returnsSplitOverChargeReference(licenceReviewResults)
  if (returnsSplitOverChargeReference) {
    issues.push('Returns split over charge references')
    status = REVIEW
  }

  const returnsNotReceived = _returnsNotReceived(licenceReviewResults)
  if (returnsNotReceived) {
    issues.push('Some returns not received')
  }

  const matchingReturns = licenceReviewResults.some((licenceReviewResult) => {
    return !(licenceReviewResult?.reviewChargeElementResultId && licenceReviewResult?.reviewReturnResultId)
  })
  if (matchingReturns) {
    issues.push('Unable to match returns')
    status = REVIEW
  }

  return { issues, status }
}

/**
 * Checks if any of the licence review results indicate that a charge element has not received its returns
 *
 * @param {Array} licenceReviewResults An array of objects containing the licence review results records
 *
 * @returns {boolean} - Returns true if there are review results indicating that returns have not been received
 */
function _returnsNotReceived (licenceReviewResults) {
  const returnsNotReceived = licenceReviewResults.some((licenceReviewResult) => {
    if (licenceReviewResult.reviewReturnResultId && licenceReviewResult.reviewChargeElementResultId) {
      if (licenceReviewResult.reviewReturnResults.status === 'due' || licenceReviewResult.reviewReturnResults.status === 'overdue') {
        return true
      }
    }

    return false
  })

  return returnsNotReceived
}

/**
 * Determines if there are multiple charge references associated with a matched return
 *
 * @param {Array} licenceReviewResults An array of objects containing the licence review results records
 *
 * @returns {boolean} Returns true if there are multiple charge references associated with different review return
 * results
 */
function _returnsSplitOverChargeReference (licenceReviewResults) {
  const seenReviewReturnResults = {}
  let returnsSplitOverChargeReference

  for (const result of licenceReviewResults) {
    const { chargeReferenceId, reviewReturnResultId } = result

    if (seenReviewReturnResults[reviewReturnResultId]) {
      if (seenReviewReturnResults[reviewReturnResultId] !== chargeReferenceId) {
        returnsSplitOverChargeReference = true
      }
    } else {
      seenReviewReturnResults[reviewReturnResultId] = chargeReferenceId
    }
  }

  return returnsSplitOverChargeReference
}

module.exports = {
  go
}
