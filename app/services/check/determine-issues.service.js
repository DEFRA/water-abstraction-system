'use strict'

/**
 * Hack service to figure out how we determine the various issues
 * @module DetermineIssuesService
 */

const REVIEW_STATUSES = [
  'Aggregate', 'Checking query', 'Overlap of charge date', 'Returns received but not processed',
  'Return split over charge references', 'Unable to allocate returns', 'Unable to match return'
]

function go (licence) {
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

  licence.issue = _determineAndAssignLicenceIssues(allIssues)
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

function _determineSomeReturnsNotReceived (chargeElement, returnRecords) {
  // NOTE: The requirement states "An element matches to multiple returns AND at least 1 of those returns has a status
  // of due". So, our first check is that the element has matched to more than one return.
  if (chargeElement.returns.length <= 1) {
    return false
  }

  for (const matchedReturn of chargeElement.returns) {
    const result = returnRecords.some((returnRecord) => {
      return (returnRecord.returnId === matchedReturn.returnId && returnRecord.status === 'due')
    })

    if (result) {
      return true
    }
  }

  return false
}

function _determineAndAssignLicenceIssues (allIssues) {
  if (allIssues.length === 0) {
    return ''
  }

  const uniqueIssues = [...new Set(allIssues)]

  if (uniqueIssues.length > 1) {
    return 'Multiple issues'
  }

  return uniqueIssues[0]
}

function _determineAndAssignReturnIssues (returns, chargeVersions, allIssues) {
  let reviewNeeded = false

  returns.forEach((returnRecord) => {
    returnRecord.issues = []

    // Over abstraction
    const overAbstraction = returnRecord.versions[0]?.lines.some((line) => {
      return line.unallocated > 0
    })
    if (overAbstraction) {
      returnRecord.issues.push('Over abstraction')
    }

    // Abstraction outside period
    if (returnRecord.abstractionOutside) {
      returnRecord.issues.push('Abstraction outside period')
    }

    // Checking query
    if (returnRecord.underQuery) {
      returnRecord.issues.push('Checking query')
    }

    // No returns received
    if (returnRecord.status === 'due') {
      returnRecord.issues.push('No returns received')
    }

    // Returns received but not processed
    if (returnRecord.status === 'received') {
      returnRecord.issues.push('Returns received but not processed')
    }

    // Returns received late
    if (returnRecord.receivedDate && returnRecord.receivedDate > returnRecord.dueDate) {
      returnRecord.issues.push('Returns received late')
    }

    // Return split over charge references
    const returnSplit = _returnSplitOverChargeReferences(returnRecord, chargeVersions)
    if (returnSplit) {
      returnRecord.issues.push('Return split over charge references')
    }

    // Review status
    if (!reviewNeeded) {
      const status = _determineIssueStatus(returnRecord.issues)
      if (status === 'Review') {
        reviewNeeded = true
      }
    }

    // This is to keep track of multiple Issues
    allIssues.push(...returnRecord.issues)
  })

  return reviewNeeded
}

function _returnSplitOverChargeReferences (returnRecord, chargeVersions) {
  return chargeVersions.some((chargeVersion) => {
    let matched = false
    for (const chargeReference of chargeVersion.chargeReferences) {
      const returnFound = chargeReference.chargeElements.some((chargeElement) => {
        return chargeElement.returns.some((matchedReturnResult) => {
          return matchedReturnResult.returnId === returnRecord.returnId
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
