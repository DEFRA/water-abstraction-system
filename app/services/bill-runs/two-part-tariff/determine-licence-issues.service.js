/**
 * @module DetermineLicenceIssuesService
 */

async function go (licence) {
  const { returnLogs } = licence
  _determineReturnLogsIssues(returnLogs)
}

function _determineReturnLogsIssues (returnLogs, licence) {
  for (const returnLog of returnLogs) {
    const returnLogIssues = []

    // Abstraction outside period issue
    if (returnLog.abstractionOutsidePeriod) {
      returnLogIssues.push('Abstraction outside period')
    }

    // Checking query issue
    if (returnLog.underQuery) {
      returnLogIssues.push('Checking query')
    }

    // No returns received
    if (returnLog.status === 'due') {
      returnLogIssues.push('No returns received')
    }

    // Over abstraction
    if (returnLog.quantity > returnLog.allocatedQuantity) {
      returnLogIssues.push('Over abstraction')
    }

    // Returns received but not processed
    if (returnLog.status === 'received') {
      returnLogIssues.push('Returns received but not processed')
    }

    // Returns received late
    if (returnLog.receivedDate > returnLog.dueDate) {
      returnLogIssues.push('Returns received late')
    }

    // Returns split over charge references
    if (_determineReturnSplitOverChargeReference(licence, returnLog)) {
      returnLogIssues.push('Return split over charge references')
    }

    returnLog.issuesPersisted = returnLogIssues
  }
}

function _determineReturnSplitOverChargeReference (licence, returnLog) {
  const returnLogId = returnLog.id

  const { chargeVersions } = licence
  const returnLogReferences = []

  for (const chargeVersion of chargeVersions) {
    const { chargeReferences } = chargeVersion

    if (chargeReferences.length === 1) {
      return false
    }

    for (const chargeReference of chargeReferences) {
      const { chargeElements } = chargeReference

      for (const chargeElement of chargeElements) {
        const { returnLogs } = chargeElement

        for (const returnLog of returnLogs) {
          if (returnLog.id === returnLogId) {
            returnLogReferences.push(chargeReference.id)
          }
        }
      }
    }
  }

  // deduplicate charge references
  const uniqueChargeReferences = [...new Set(returnLogReferences)]

  if (uniqueChargeReferences.length > 1) {
    return true
  }

  return false
}

module.exports = {
  go
}
