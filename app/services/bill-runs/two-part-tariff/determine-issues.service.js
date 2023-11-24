'use strict'

/**
 * Hack service to figure out how we determine the various issues
 * @module DetermineIssuesService
 */

function go (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence
    licence.allIssues = []

    _determineAndAssignReturnIssues(returns, licence)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements, aggregate } = chargeReference

        _determineAndAssignChargeElementIssues(chargeElements, aggregate, licence)
      })
    })
    _determineAndAssignLicenceIssues(licence)
  })
}

function _determineAndAssignLicenceIssues (licence) {
  const dedupedIssues = [...new Set(licence.allIssues)]

  // Multiple Issues
  if (dedupedIssues.length > 1) {
    licence.issues.push('Multiple Issues')
  }
}

function _determineAndAssignReturnIssues (returnLogs, licence) {
  returnLogs.forEach((returnLog) => {
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

    // This is to keep track of multiple Issues
    licence.allIssues.push(returnLog.issues)
  })
}

function _determineAndAssignChargeElementIssues (chargeElements, aggregate, licence) {
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

    // This is to keep track of multiple Issues
    licence.allIssues.push(chargeElement.issues)
  })
}

module.exports = {
  go
}
