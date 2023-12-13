'use strict'

/**
 * Hack service to figure out how we determine the various issues
 * @module DetermineIssuesService
 */

const REVIEW_STATUSES = [
  'Aggregate', 'Checking query', 'Overlap of charge dates', 'Returns received but not processed',
  'Return split over charge references', 'Unable to allocate returns', 'Unable to match return'
]

function go (licence) {
  const { chargeVersions, returnLogs } = licence
  const allIssues = []

  licence.status = 'Ready'

  const returnReviewNeeded = _determineAndAssignReturnIssues(returnLogs, chargeVersions, allIssues)

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements, aggregate } = chargeReference

      const chargeElementReviewNeeded = _determineAndAssignChargeElementIssues(chargeElements, aggregate, returnLogs, allIssues)

      if (returnReviewNeeded || chargeElementReviewNeeded) {
        licence.status = 'Review'
      }
    })
  })

  licence.issue = _determineAndAssignLicenceIssues(allIssues)
}

function _determineAndAssignChargeElementIssues (chargeElements, aggregate, returnLogs, allIssues) {
  let reviewNeeded = false

  chargeElements.forEach((chargeElement) => {
    chargeElement.issues = []

    // Unable to match return
    if (chargeElement.returnLogs && chargeElement.returnLogs.length === 0) {
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
    if (_determineSomeReturnsNotReceived(chargeElement, returnLogs)) {
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
  if (!chargeElement.returnLogs || chargeElement.returnLogs.length <= 1) {
    return false
  }

  for (const matchedReturn of chargeElement.returnLogs) {
    const result = returnLogs.some((returnLog) => {
      return (returnLog.id === matchedReturn.id && returnLog.status === 'due')
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

function _determineAndAssignReturnIssues (returnLogs, chargeVersions, allIssues) {
  let reviewNeeded = false

  returnLogs.forEach((returnLog) => {
    returnLog.issues = []

    // Over abstraction
    const overAbstraction = returnLog.returnSubmissions[0]?.returnSubmissionLines.some((line) => {
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
  let matched = false

  for (const chargeVersion of chargeVersions) {
    for (const chargeReference of chargeVersion.chargeReferences) {
      const returnFound = chargeReference.chargeElements.some((chargeElement) => {
        // NOTE: If a chargeElement is linked to a charge version where the chargePeriod doesn't get set, then it will
        // never be prepared and therefore never have a `.returns` property. The scenario this can happen in is where
        // a charge version (plus reference and element) get setup but then someone sets an expired/lapsed/revoked date
        // prior to the charge version. This would result in an invalid charge period which means we don't bother to
        // prep and match the charge version. A real example of this is 6/33/52/*S/0222 which has an SROC 2PT charge
        // version but was marked as lapsed on 16 June 2009. Either the CV import allowed the CV to be created, or NALD
        // was updated after the charge version was created.
        if (!chargeElement.returnLogs) {
          return false
        }

        return chargeElement.returnLogs.some((matchedReturnResult) => {
          return matchedReturnResult.id === returnLog.id
        })
      })

      if (matched && returnFound) {
        return true
      }

      if (!matched && returnFound) {
        matched = true
      }
    }
  }

  return false
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
