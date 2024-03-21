'use strict'

/**
 * Determines the issues on a licences for a two-part tariff bill run
 * @module DetermineLicenceIssuesService
 */

const { twoPartTariffReviewIssues } = require('../../../lib/static-lookups.lib.js')

/**
 * Determines the issues on a licence charge elements and return logs and sets the status based on them
 *
 * @param {module:LicenceModel} licence - the two-part tariff licence included in the bill run
 */
async function go (licence) {
  const { returnLogs: licenceReturnLogs, chargeVersions } = licence

  const allReturnIssues = _determineReturnLogsIssues(licenceReturnLogs, licence)
  const allElementIssues = _determineChargeElementsIssues(chargeVersions, licenceReturnLogs)

  licence.status = _determineLicenceStatus(allElementIssues, allReturnIssues)
  licence.issues = [...allElementIssues, ...allReturnIssues]
}

function _determineChargeElementsIssues (chargeVersions, licenceReturnLogs) {
  const allElementIssues = []

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements } = chargeReference

      chargeElements.forEach((chargeElement) => {
        const { returnLogs } = chargeElement

        const { elementIssues, status } = _elementIssues(chargeReference, chargeElement, licenceReturnLogs, returnLogs)

        chargeElement.issues = elementIssues
        chargeElement.status = status
        allElementIssues.push(...elementIssues)
      })
    })
  })

  return allElementIssues
}

function _determineLicenceStatus (allElementIssues, allReturnIssues) {
  const allLicenceIssues = [...allElementIssues, ...allReturnIssues]
  const reviewStatuses = _getReviewStatuses()

  // If a licence has more than one issue, or has 1 issue that is in the `REVIEW_STATUSES` array the licence status is
  // set to 'Review' otherwise its 'Ready'
  if (allLicenceIssues.length > 1 || reviewStatuses.includes(allLicenceIssues[0])) {
    return 'review'
  } else {
    return 'ready'
  }
}

function _determineReturnLogsIssues (returnLogs, licence) {
  const allReturnsIssues = []

  returnLogs.forEach((returnLog) => {
    const returnLogIssues = _returnLogIssues(returnLog, licence)

    returnLog.issues = returnLogIssues
    allReturnsIssues.push(...returnLogIssues)
  })

  return allReturnsIssues
}

function _determineReturnSplitOverChargeReference (licence, returnLog) {
  let chargeReferenceCounter = 0
  const { chargeVersions } = licence

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements } = chargeReference

      // We do a .some here as we only care if the returnLog is present in the chargeReference at least once. If the
      // return is present we increase our chargeReference counter by 1 to tally up how many unique chargeReference have
      // matched to the return
      const returnLogInChargeReference = chargeElements.some((chargeElement) => {
        const { returnLogs: chargeElementReturnLogs } = chargeElement

        return chargeElementReturnLogs.some((chargeElementReturnLog) => {
          return chargeElementReturnLog.returnId === returnLog.id
        })
      })

      if (returnLogInChargeReference) {
        chargeReferenceCounter++
      }
    })
  })

  return chargeReferenceCounter > 1
}

function _elementIssues (chargeReference, chargeElement, licenceReturnLogs, returnLogs) {
  let status = 'ready'
  const elementIssues = []

  // Issue Aggregate
  if (chargeReference.aggregate !== null && chargeReference.aggregate !== 1) {
    elementIssues.push(twoPartTariffReviewIssues['aggregate-factor'])
    status = 'review'
  }

  // Issue Overlap of charge dates
  if (chargeElement.chargeDatesOverlap) {
    elementIssues.push(twoPartTariffReviewIssues['overlap-of-charge-dates'])
    status = 'review'
  }

  // Issue Some returns not received
  if (_someReturnsNotReceived(returnLogs, licenceReturnLogs)) {
    elementIssues.push(twoPartTariffReviewIssues['some-returns-not-received'])
  }

  // Unable to match return
  if (returnLogs.length < 1) {
    elementIssues.push(twoPartTariffReviewIssues['unable-to-match-return'])
    status = 'review'
  }

  return { elementIssues, status }
}

/**
 * Returns a list of issues that would put a licence into a status of 'review'
 *
 * @returns {Object[]} An array of issues that would put a licence into a status of 'review'
 */
function _getReviewStatuses () {
  // the keys for the issues that will put the licence into review status
  const reviewStatusKeys = [
    'aggregate-factor',
    'checking-query',
    'overlap-of-charge-dates',
    'returns-received-not-processed',
    'return-split-over-refs',
    'unable-to-match-return'
  ]

  const reviewStatuses = reviewStatusKeys.map((reviewStatusKey) => twoPartTariffReviewIssues[reviewStatusKey])

  return reviewStatuses
}

function _returnLogIssues (returnLog, licence) {
  const returnLogIssues = []

  // Abstraction outside period issue
  if (returnLog.abstractionOutsidePeriod) {
    returnLogIssues.push(twoPartTariffReviewIssues['abs-outside-period'])
  }

  // Checking query issue
  if (returnLog.underQuery) {
    returnLogIssues.push(twoPartTariffReviewIssues['checking-query'])
  }

  // No returns received
  if (returnLog.status === 'due') {
    returnLogIssues.push(twoPartTariffReviewIssues['no-returns-received'])
  }

  // Over abstraction
  if (returnLog.quantity > returnLog.allocatedQuantity) {
    returnLogIssues.push(twoPartTariffReviewIssues['over-abstraction'])
  }

  // Returns received but not processed
  if (returnLog.status === 'received') {
    returnLogIssues.push(twoPartTariffReviewIssues['returns-received-not-processed'])
  }

  // Returns received late
  if (returnLog.receivedDate > returnLog.dueDate) {
    returnLogIssues.push(twoPartTariffReviewIssues['returns-late'])
  }

  // Returns split over charge references
  if (_determineReturnSplitOverChargeReference(licence, returnLog)) {
    returnLogIssues.push(twoPartTariffReviewIssues['return-split-over-refs'])
  }

  return returnLogIssues
}

function _someReturnsNotReceived (returnLogs, licenceReturnLogs) {
  const returnLogIds = returnLogs.map((returnLog) => {
    return returnLog.returnId
  })

  return licenceReturnLogs.some((licenceReturnLog) => {
    return returnLogIds.includes(licenceReturnLog.id) && licenceReturnLog.status === 'due'
  })
}

module.exports = {
  go
}
