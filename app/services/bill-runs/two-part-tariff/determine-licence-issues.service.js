/**
 * @module DetermineLicenceIssuesService
 */

// A list of issues that would put a licence into a status of 'review'
const REVIEW_STATUSES = [
  'Aggregate factor', 'Checking query', 'Overlap of charge dates', 'Returns received but not processed',
  'Returns split over charge references', 'Unable to match returns'
]

async function go (licence) {
  const { returnLogs: licenceReturnLogs, chargeVersions } = licence

  const allReturnIssues = _determineReturnLogsIssues(licenceReturnLogs, licence)
  const allElementIssues = _determineElementIssues(chargeVersions, licenceReturnLogs)

  licence.status = _determineLicenceStatus(allElementIssues, allReturnIssues)
}

function _determineLicenceStatus (allElementIssues, allReturnIssues) {
  const allLicenceIssues = [...allElementIssues, ...allReturnIssues]

  // If a licence has more than one issue, or has 1 issue that is in the `REVIEW_STATUSES` array the licence status is
  // set to 'Review' otherwise its 'Ready'
  if (allLicenceIssues.length > 1 || REVIEW_STATUSES.includes(allLicenceIssues[0])) {
    return 'review'
  } else {
    return 'ready'
  }
}

function _determineElementIssues (chargeVersions, licenceReturnLogs) {
  const allElementIssues = []
  let status = 'ready'

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements } = chargeReference

      chargeElements.forEach((chargeElement) => {
        const { returnLogs } = chargeElement

        const elementIssues = []

        // Issue Aggregate
        if (chargeReference.aggregate !== 1) {
          elementIssues.push('Aggregate factor')
          status = 'review'
        }

        // Issue Overlap of charge dates
        if (chargeElement.chargeDatesOverlap) {
          elementIssues.push('Overlap of charge dates')
          status = 'review'
        }

        // Issue Some returns not received
        if (_someReturnsNotReceived(returnLogs, licenceReturnLogs)) {
          elementIssues.push('Some returns not received')
        }

        // Unable to match return
        if (returnLogs.length < 1) {
          elementIssues.push('Unable to match return')
          status = 'review'
        }

        chargeElement.issues = elementIssues
        chargeElement.status = status
        allElementIssues.push(...elementIssues)
      })
    })
  })

  return allElementIssues
}

function _someReturnsNotReceived (returnLogs, licenceReturnLogs) {
  const returnLogIds = returnLogs.map(returnLog => returnLog.returnId)

  return licenceReturnLogs.some((licenceReturnLog) => {
    return returnLogIds.includes(licenceReturnLog.id) && licenceReturnLog.status === 'due'
  })
}

function _determineReturnLogsIssues (returnLogs, licence) {
  const allReturnsIssues = []

  returnLogs.forEach((returnLog) => {
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
    allReturnsIssues.push(...returnLogIssues)
  })

  return allReturnsIssues
}

function _determineReturnSplitOverChargeReference (licence, returnLog) {
  let chargeReferenceCounter = 0

  const returnLogId = returnLog.id
  const { chargeVersions } = licence

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements } = chargeReference

      // We do a .some here as we only care if the returnLog is present in the chargeReference at least once. If the
      // return is present we increase our chargeReference counter by 1 to tally up how many unique chargeReference have
      // matched to the return
      const returnLogInChargeReference = chargeElements.some((chargeElement) => {
        const { returnLogs } = chargeElement

        return returnLogs.some((returnLog) => {
          return returnLog.returnId === returnLogId
        })
      })

      if (returnLogInChargeReference) {
        chargeReferenceCounter++
      }
    })
  })

  return chargeReferenceCounter > 1
}

module.exports = {
  go
}
