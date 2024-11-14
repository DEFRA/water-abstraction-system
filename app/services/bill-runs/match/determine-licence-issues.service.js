'use strict'

/**
 * Determines the issues on a licence for a two-part tariff bill run
 * @module DetermineLicenceIssuesService
 */

const { twoPartTariffReviewIssues } = require('../../../lib/static-lookups.lib.js')

/**
 * Determines the issues on a licence for a two-part tariff bill run
 *
 * The issues we determine are not related directly to the licence. They are with either the returns or the charge
 * elements linked to the licence.
 *
 * But the review screens in the UI work from the context of a licence and the main page needs to show whether a licence
 * has any issues and whether it is in 'review'. Only when a user clicks through to look at the results for a licence
 * will they see which of its returns and charge elements have the issues.
 *
 * If only one issue is found we still assign it to the licence (and the charge element or return in question) for later
 * persisting in a `ReviewLicence` record. We also check the issue against a list of those that will flag the licence
 * for review.
 *
 * > No result is returned. The issues are directly assigned to the licence and its relevant properties
 *
 * @param {module:LicenceModel} licence - The two-part tariff licence to determine issues for
 */
function go (licence) {
  const { returnLogs: licenceReturnLogs, chargeVersions } = licence

  const allReturnIssues = _determineReturnLogsIssues(licenceReturnLogs, licence)
  const allElementIssues = _determineChargeElementsIssues(chargeVersions, licenceReturnLogs)

  licence.status = _determineLicenceStatus(allElementIssues, allReturnIssues)
  licence.issues = _licenceIssues(allElementIssues, allReturnIssues)
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

  // If a licence has 1 issue that is in the `REVIEW_STATUSES` array the licence status is
  // set to 'Review' otherwise its 'Ready'
  const hasReviewIssue = allLicenceIssues.some((issue) => {
    return reviewStatuses.includes(issue)
  })

  return hasReviewIssue ? 'review' : 'ready'
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

  // Issue Some returns not received / No returns received
  const { noReturnsReceived, someReturnsNotReceived } = _returnsReceivedStatus(returnLogs, licenceReturnLogs)

  if (noReturnsReceived) {
    elementIssues.push(twoPartTariffReviewIssues['no-returns-received'])
  }

  if (someReturnsNotReceived) {
    elementIssues.push(twoPartTariffReviewIssues['some-returns-not-received'])
  }

  // Unable to match return
  if (returnLogs.length < 1) {
    elementIssues.push(twoPartTariffReviewIssues['unable-to-match-return'])
    status = 'review'
  }

  return { elementIssues, status }
}

function _getMatchingReturns (returnLogs, licenceReturnLogs) {
  const returnLogIds = returnLogs.map((returnLog) => {
    return returnLog.returnId
  })

  // We need to filter the returnLogs on the licence to find the matching returns for our charge element.
  // The returnLogs on our charge element object lack the return status, so we must retrieve them from the licence where
  // the status is available
  return licenceReturnLogs.filter((licenceReturnLog) => {
    return returnLogIds.includes(licenceReturnLog.id)
  })
}

/**
 * Returns a list of issues that would put a licence into a status of 'review'
 *
 * @returns {object[]} An array of issues that would put a licence into a status of 'review'
 *
 * @private
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

  const reviewStatuses = reviewStatusKeys.map((reviewStatusKey) => {
    return twoPartTariffReviewIssues[reviewStatusKey]
  })

  return reviewStatuses
}

function _licenceIssues (allElementIssues, allReturnIssues) {
  const allIssues = [...allElementIssues, ...allReturnIssues]
  const uniqueIssues = new Set(allIssues)

  if (uniqueIssues.size > 1) {
    uniqueIssues.add('Multiple issues')
  }

  return [...uniqueIssues].sort()
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

/**
 * Determines the received status of returns matched to a charge element.
 *
 * - If no matching returns have a status of 'due', `noReturnsReceived` and 'someReturnsNotReceived is `false`.
 * - If some of the matching returns, but not all, have a status of 'due', `someReturnsNotReceived` is `true`.
 * - If all matching returns have a status of 'due', `noReturnsReceived` is `true`.
 *
 * @private
 */
function _returnsReceivedStatus (returnLogs, licenceReturnLogs) {
  const matchingReturnLogs = _getMatchingReturns(returnLogs, licenceReturnLogs)

  const someReturnsNotReceived = matchingReturnLogs.some((matchingReturnLog) => {
    return matchingReturnLog.status === 'due'
  })

  let noReturnsReceived = false

  if (someReturnsNotReceived) {
    noReturnsReceived = matchingReturnLogs.every((matchingReturnLog) => {
      return matchingReturnLog.status === 'due'
    })
  }

  return {
    someReturnsNotReceived: someReturnsNotReceived && !noReturnsReceived,
    noReturnsReceived
  }
}

module.exports = {
  go
}
