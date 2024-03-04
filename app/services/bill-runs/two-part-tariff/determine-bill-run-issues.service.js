'use strict'

/**
 * Determines the issues on the licences for a two-part tariff bill run
 * @module DetermineBillRunIssuesService
 */

const FetchReviewResultsService = require('./fetch-review-results.service.js')

// A list of issues that would put a licence into a status of 'review'
const REVIEW_STATUSES = [
  'Aggregate factor', 'Checking query', 'Overlap of charge dates', 'Returns received but not processed',
  'Returns split over charge references', 'Unable to match returns'
]

/**
 * Fetches the review data on a licence and determines all the issues and licence status
 *
 * @param {module:LicenceModel} licences the two-part tariff licence included in the bill run
 */
async function go (licences) {
  for (const licence of licences) {
    const licenceReviewResults = await FetchReviewResultsService.go(licence.id)
    const { issues, status } = _determineIssues(licenceReviewResults)

    licence.issues = issues
    licence.status = status
  }
}

function _abstractionOutsidePeriod (issues, licenceReviewResults) {
  const abstractionOutsidePeriod = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.abstractionOutsidePeriod
  })

  if (abstractionOutsidePeriod) {
    issues.push('Abstraction outside period')
  }
}

function _determineIssues (licenceReviewResults) {
  const issues = []

  _abstractionOutsidePeriod(issues, licenceReviewResults)

  _hasAggregate(issues, licenceReviewResults)

  _underQuery(issues, licenceReviewResults)

  _noReturnsReceived(issues, licenceReviewResults)

  _overAbstracted(issues, licenceReviewResults)

  _hasChargeDatesOverlap(issues, licenceReviewResults)

  _notProcessed(issues, licenceReviewResults)

  _receivedLate(issues, licenceReviewResults)

  _returnsSplitOverChargeReference(issues, licenceReviewResults)

  _returnsNotReceived(issues, licenceReviewResults)

  _matchingReturns(issues, licenceReviewResults)

  const status = _determineIssueStatus(issues)

  return { issues, status }
}

function _determineIssueStatus (issues) {
  const hasReviewIssue = issues.some((issue) => {
    return REVIEW_STATUSES.includes(issue)
  })

  if (hasReviewIssue) {
    return 'review'
  }

  return 'ready'
}

function _hasAggregate (issues, licenceReviewResults) {
  const hasAggregate = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewChargeElements?.aggregate !== 1
  })

  if (hasAggregate) {
    issues.push('Aggregate factor')
  }
}

function _hasChargeDatesOverlap (issues, licenceReviewResults) {
  const hasChargeDatesOverlap = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewChargeElements?.chargeDatesOverlap
  })

  if (hasChargeDatesOverlap) {
    issues.push('Overlap of charge dates')
  }
}

function _matchingReturns (issues, licenceReviewResults) {
  const matchingReturns = licenceReviewResults.some((licenceReviewResult) => {
    return !(licenceReviewResult?.reviewChargeElementId && licenceReviewResult?.reviewReturnId)
  })

  if (matchingReturns) {
    issues.push('Unable to match returns')
  }
}

function _notProcessed (issues, licenceReviewResults) {
  const notProcessed = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.status === 'received'
  })

  if (notProcessed) {
    issues.push('Returns received but not processed')
  }
}

function _noReturnsReceived (issues, licenceReviewResults) {
  const noReturnsReceived = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.status === 'due'
  })

  if (noReturnsReceived) {
    issues.push('No returns received')
  }
}

function _overAbstracted (issues, licenceReviewResults) {
  const overAbstracted = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.quantity > licenceReviewResult.reviewReturns?.allocated
  })

  if (overAbstracted) {
    issues.push('Over abstraction')
  }
}

function _receivedLate (issues, licenceReviewResults) {
  const receivedLate = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.receivedDate > licenceReviewResult.reviewReturns?.dueDate
  })

  if (receivedLate) {
    issues.push('Returns received late')
  }
}

function _underQuery (issues, licenceReviewResults) {
  const underQuery = licenceReviewResults.some((licenceReviewResult) => {
    return licenceReviewResult.reviewReturns?.underQuery
  })

  if (underQuery) {
    issues.push('Checking query')
  }
}

/**
 * Checks if any of the licence review results indicate that a charge element has not received its returns
 */
function _returnsNotReceived (issues, licenceReviewResults) {
  const returnsNotReceived = licenceReviewResults.some((licenceReviewResult) => {
    return (licenceReviewResult.reviewReturnId &&
      licenceReviewResult.reviewChargeElementId &&
      (licenceReviewResult.reviewReturns.status === 'due' ||
      licenceReviewResult.reviewReturns.status === 'overdue')
    )
  })

  if (returnsNotReceived) {
    issues.push('Some returns not received')
  }
}

/**
 * Determines if there are multiple charge references associated with a matched return
 */
function _returnsSplitOverChargeReference (issues, licenceReviewResults) {
  const seenReviewReturns = {}
  let returnsSplitOverChargeReference

  for (const result of licenceReviewResults) {
    const { chargeReferenceId, reviewReturnId } = result

    if (seenReviewReturns[reviewReturnId]) {
      if (seenReviewReturns[reviewReturnId] !== chargeReferenceId) {
        returnsSplitOverChargeReference = true
      }
    } else {
      seenReviewReturns[reviewReturnId] = chargeReferenceId
    }
  }

  if (returnsSplitOverChargeReference) {
    issues.push('Returns split over charge references')
  }
}

module.exports = {
  go
}
