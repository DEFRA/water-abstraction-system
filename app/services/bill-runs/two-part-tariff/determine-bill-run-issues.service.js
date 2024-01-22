'use strict'

/**
 * Determines the issues on the licence for a two-part tariff bill run
 * @module DetermineBillRunIssuesService
 */

const FetchReviewResultsService = require('./fetch-review-results.service.js')

/**
 *
 * @param {*} licenceResults
 * @returns
 */
async function go (licenceId) {
  const licenceResults = await FetchReviewResultsService.go(licenceId)

  const { issues, status } = _determineIssues(licenceResults)

  return { issues, status }
}

function _determineIssues (licenceResults) {
  let status = 'Ready'
  const issues = []

  const abstractionOutsidePeriod = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.abstractionOutsidePeriod)
  if (abstractionOutsidePeriod) {
    issues.push('Abstraction outside period')
  }

  const hasAggregate = licenceResults.some(reviewResult => reviewResult.reviewChargeElementResults?.aggregate !== 1)
  if (hasAggregate) {
    issues.push('Aggregate factor')
    status = 'Review'
  }

  const underQuery = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.underQuery)
  if (underQuery) {
    issues.push('Checking query')
    status = 'Review'
  }

  const noReturnsReceived = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.status === 'due' || 'overdue')
  if (noReturnsReceived) {
    issues.push('No returns received')
  }

  const overAbstracted = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.quantity > reviewResult.reviewReturnResults?.allocated)
  if (overAbstracted) {
    issues.push('Over abstraction')
  }

  const hasChargeDatesOverlap = licenceResults.some(reviewResult => reviewResult.reviewChargeElementResults?.chargeDatesOverlap)
  if (hasChargeDatesOverlap) {
    issues.push('Overlap of charge dates')
    status = 'Review'
  }

  const notProcessed = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.status === 'received')
  if (notProcessed) {
    issues.push('Returns received but not processed')
    status = 'Review'
  }

  const receivedLate = licenceResults.some(reviewResult => reviewResult.reviewReturnResults?.receivedDate > reviewResult.reviewReturnResults?.dueDate)
  if (receivedLate) {
    issues.push('Returns received late')
  }

  const returnsSplitOverChargeReference = _returnsSplitOverChargeReference(licenceResults)
  if (returnsSplitOverChargeReference) {
    issues.push('Returns split over charge references')
    status = 'Review'
  }

  const returnsNotReceived = _returnsNotReceived(licenceResults)
  if (returnsNotReceived) {
    issues.push('Some returns not received')
  }

  const matchingReturns = licenceResults.some(reviewResult => !(reviewResult?.reviewChargeElementResultId && reviewResult?.reviewReturnResultId))
  if (matchingReturns) {
    issues.push('Unable to match returns')
    status = 'Review'
  }

  return { issues, status }
}

/**
 *
 */
function _returnsNotReceived (licenceResults) {
  const returnsNotReceived = licenceResults.some((reviewResult) => {
    if (reviewResult.reviewReturnResultId && reviewResult.reviewChargeElementResultId) {
      if (reviewResult.reviewReturnResults.status === 'due' || reviewResult.reviewReturnResults.status === 'overdue') {
        return true
      }
    }

    return false
  })

  return returnsNotReceived
}

/**
 *
 */
function _returnsSplitOverChargeReference (licenceResults) {
  const seenReviewReturnResults = {}
  let returnsSplitOverChargeReference

  for (const result of licenceResults) {
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
