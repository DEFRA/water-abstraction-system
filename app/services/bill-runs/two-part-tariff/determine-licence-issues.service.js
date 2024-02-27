/**
 * @module DetermineLicenceIssuesService
 */

async function go (licence) {
  const { returnLogs: licenceReturnLogs, chargeVersions } = licence

  const licenceIssues = []
  _determineReturnLogsIssues(licenceReturnLogs, licenceIssues)
  const elementStatus = _determineElementIssues(chargeVersions, licenceReturnLogs)

  licence.status = _determineLicenceStatus(elementStatus)
}

function _determineLicenceStatus (elementStatus) {
  const reviewStatus = elementStatus.some((status) => {
    return status === 'Review'
  })

  if (reviewStatus) {
    return 'Review'
  }

  return 'Ready'
}

function _determineElementIssues (chargeVersions, licenceReturnLogs) {
  const elementIssues = []
  const elementsStatuses = []
  let status = 'Ready'

  for (const chargeVersion of chargeVersions) {
    const { chargeReferences } = chargeVersion

    for (const chargeReference of chargeReferences) {
      const { chargeElements } = chargeReference

      for (const chargeElement of chargeElements) {
        const { returnLogs } = chargeElement

        // Issue Aggregate
        if (chargeReference.aggregate) {
          elementIssues.push('Aggregate')
          status = 'Review'
        }

        // Issue Overlap of charge dates
        if (chargeElement.chargeDatesOverlap) {
          elementIssues.push('Overlap of charge dates')
          status = 'Review'
        }

        // Issue Some returns not received
        if (_someReturnsNotReceived(returnLogs, licenceReturnLogs)) {
          elementIssues.push('Some returns not received')
        }

        // Unable to match return
        if (returnLogs.length < 1) {
          elementIssues.push('Unable to match return')
          status = 'Review'
        }

        chargeElement.issues = elementIssues
        chargeElement.status = status
        elementsStatuses.push(status)
      }
    }
  }

  return elementsStatuses
}

function _someReturnsNotReceived (returnLogs, licenceReturnLogs) {
  const returnLogIds = returnLogs.map(returnLog => returnLog.returnId)

  licenceReturnLogs.some((licenceReturnLog) => {
    return returnLogIds.includes(licenceReturnLog.id) && licenceReturnLog.status === 'due'
  })
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

    returnLog.issues = returnLogIssues
  }
}

function _determineReturnSplitOverChargeReference (licence, returnLog) {
  let chargeReferenceCounter = 0

  const returnLogId = returnLog.id
  const { chargeVersions } = licence

  for (const chargeVersion of chargeVersions) {
    const { chargeReferences } = chargeVersion

    for (const chargeReference of chargeReferences) {
      const { chargeElements } = chargeReference

      // We do a .some here as we only care if the returnLog is present in the chargeReference at least once. If the
      // return is present we increase our chargeReference counter by 1 to tally up how many unique chargeReference have
      // matched to the return
      const returnLogInChargeReference = chargeElements.some((chargeElement) => {
        const { returnLogs } = chargeElement

        return returnLogs.some((returnLog) => {
          return returnLog.id === returnLogId
        })
      })

      if (returnLogInChargeReference) {
        chargeReferenceCounter++
      }
    }
  }

  return chargeReferenceCounter > 1
}

module.exports = {
  go
}
