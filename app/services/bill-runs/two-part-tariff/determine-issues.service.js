'use strict'

/**
 * Hack service to figure out how we determine the various issues
 * @module DetermineIssuesService
 */

function go (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence
    _determineAndAssignReturnIssues(returns, licence)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements, aggregate } = chargeReference

        _determineAndAssignChargeElementIssues(chargeElements, aggregate)
      })
    })
  })
}

// function _determineAndAssignLicenceIssues (licence)

function _determineAndAssignReturnIssues (returnLogs, licence) {
  licence.allIssues = []
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

    // multiple Issues
    allIssues.push(returnLog.issues)
    if (returnLog.issues.length > 1) {
      licence.issues.push('No returns received')
    }
  })
}

function _determineAndAssignChargeElementIssues (chargeElements, aggregate) {
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
  })
}

module.exports = {
  go
}
