'use strict'

/**
 * Hack service to figure out how we determine the various issues
 * @module DetermineIssuesService
 */

const REVIEW_STATUSES = [
  'Aggregate', 'Checking query', 'Overlap of charge date', 'Returns received but not processed',
  'Return split over charge references', 'Unable to allocate returns', 'Unable to match return'
]

function go (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence
    const allIssues = []

    licence.status = 'Ready'

    const returnReviewNeeded = _determineAndAssignReturnIssues(returns, chargeVersions, allIssues)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements, aggregate } = chargeReference

        const chargeElementReviewNeeded = _determineAndAssignChargeElementIssues(chargeElements, aggregate, returns, allIssues)

        if (returnReviewNeeded || chargeElementReviewNeeded) {
          licence.status = 'Review'
        }
      })
    })

    _determineAndAssignLicenceIssues(licence, allIssues)
  })
}

function _determineAndAssignChargeElementIssues (chargeElements, aggregate, returns, allIssues) {
  let reviewNeeded = false

  chargeElements.forEach((chargeElement) => {
    chargeElement.issues = []

    // Unable to match return
    if (chargeElement.returns.length === 0) {
      chargeElement.issues.push('Unable to match return')
    }

    // Aggregate
    if (aggregate && aggregate !== 1) {
      chargeElement.issues.push('Aggregate')
    }

    // Overlap of charge dates
    if (chargeElement.chargeDatesOverlap) {
      chargeElement.issues.push('Overlap of charge dates')
    }

    // Some returns not received
    if (_determineSomeReturnsNotReceived(chargeElement, returns)) {
      chargeElement.issues.push('Some returns not received')
    }

    // Review status
    chargeElement.status = _determineIssueStatus(chargeElement.issues)
    if (!reviewNeeded && chargeElement.status === 'Review') {
      reviewNeeded = true
    }

    // This is to keep track of multiple Issues
    allIssues.push(...chargeElement.issues)
  })

  return reviewNeeded
}

function _determineSomeReturnsNotReceived (chargeElement, returnLogs) {
  // NOTE: The requirement states "An element matches to multiple returns AND at least 1 of those returns has a status
  // of due". So, our first check is that the element has matched to more than one return.
  if (chargeElement.returns.length <= 1) {
    return false
  }

  for (const matchedReturn of chargeElement.returns) {
    const returnLog = returnLogs.find((returnLog) => {
      return returnLog.returnId === matchedReturn.returnId
    })

    if (returnLog.status === 'due') {
      return true
    }
  }

  return false
}

function _determineAndAssignLicenceIssues (licence, allIssues) {
  licence.issues = [...new Set(allIssues)]

  // Multiple Issues
  if (licence.issues.length > 1) {
    licence.issues = ['Multiple Issues']
  }
}

function _determineAndAssignReturnIssues (returnLogs, chargeVersions, allIssues) {
  let reviewNeeded = false

  returnLogs.forEach((returnLog) => {
    returnLog.issues = []

    // Over abstraction
    const overAbstraction = returnLog.versions[0]?.lines.some((line) => {
      return line.unallocated > 0
    })
    if (overAbstraction) {
      returnLog.issues.push('Over abstraction')
    }

    // Abstraction outside period
    if (returnLog.abstractionOutside) {
      returnLog.issues.push('Abstraction outside period')
    }

    // Checking query
    if (returnLog.underQuery) {
      returnLog.issues.push('Checking query')
    }

    // No returns received
    if (returnLog.status === 'due') {
      returnLog.issues.push('No returns received')
    }

    // Returns received but not processed
    if (returnLog.status === 'received') {
      returnLog.issues.push('Returns received but not processed')
    }

    // Returns received late
    if (returnLog.receivedDate && returnLog.receivedDate > returnLog.dueDate) {
      returnLog.issues.push('Returns received late')
    }

    // Return split over charge references
    const returnSplit = _returnSplitOverChargeReferences(returnLog, chargeVersions)
    if (returnSplit) {
      returnLog.issues.push('Return split over charge references')
    }

    // Review status
    if (!reviewNeeded) {
      const status = _determineIssueStatus(returnLog.issues)
      if (status === 'Review') {
        reviewNeeded = true
      }
    }

    // This is to keep track of multiple Issues
    allIssues.push(...returnLog.issues)
  })

  return reviewNeeded
}

function _returnSplitOverChargeReferences (returnLog, chargeVersions) {
  return chargeVersions.some((chargeVersion) => {
    let matched = false
    for (const chargeReference of chargeVersion.chargeReferences) {
      const returnFound = chargeReference.chargeElements.some((chargeElement) => {
        return chargeElement.returns.some((matchedReturnResult) => {
          return matchedReturnResult.returnId === returnLog.returnId
        })
      })

      if (matched && returnFound) {
        return true
      }

      if (!matched && returnFound) {
        matched = true
      }
    }

    return false
  })
}

function _determineIssueStatus (issues) {
  const hasReviewIssue = issues.some((issue) => {
    return REVIEW_STATUSES.includes(issue)
  })

  if (hasReviewIssue) {
    return 'Review'
  }

  return 'Ready'
}

module.exports = {
  go
}
