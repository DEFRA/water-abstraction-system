'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review licence data for presentation
 *
 * @param {module:BillRunModel} billRun the data from the bill run
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review licence page
 */
function go (billRun, licence) {
  return {
    billRunId: billRun.id,
    status: 'review',
    region: billRun.region.displayName,
    licence: {
      licenceId: licence[0].licenceId,
      licenceRef: licence[0].licenceRef,
      status: licence[0].status,
      licenceHolder: licence[0].licenceHolder
    },
    chargePeriodDates: _prepareLicenceChargePeriods(licence),
    matchedReturns: _matchedReturns(licence[0].reviewReturns),
    unmatchedReturns: _unmatchedReturns(licence[0].reviewReturns),
    chargeData: _prepareChargeData(licence)
  }
}

function _chargeVersionSummary (reviewChargeVersion) {
  const { reviewChargeReferences } = reviewChargeVersion

  const chargeReferenceCount = reviewChargeReferences.length
  const chargeElementCount = reviewChargeReferences.reduce((total, reviewChargeReference) => total + reviewChargeReference.reviewChargeElements.length, 0)

  const chargeReferenceSentence = `${chargeReferenceCount} charge reference${chargeReferenceCount !== 1 ? 's' : ''} with`
  const chargeElementSentence = `${chargeElementCount} two-part tariff element${chargeElementCount !== 1 ? 's' : ''}`

  return `${chargeReferenceSentence} ${chargeElementSentence}`
}

function _prepareChargeData (licence) {
  const preparedChargeData = []

  const { reviewChargeVersions } = licence[0]
  for (const reviewChargeVersion of reviewChargeVersions) {
    preparedChargeData.push({
      financialYear: '',
      chargePeriodDate: `Charge period ${_prepareDate(reviewChargeVersion.chargePeriodStartDate, reviewChargeVersion.chargePeriodEndDate)}`,
      licenceHolderName: licence[0].licenceHolder,
      chargeVersionSummary: _chargeVersionSummary(reviewChargeVersion),
      billingAccountDetails: '',
      chargeVersion: '',
      chargeReferences: []
    })
  }

  return preparedChargeData
}

function _prepareLicenceChargePeriods (licence) {
  const { reviewChargeVersions } = licence[0]
  const chargePeriodDates = []

  for (const reviewChargeVersion of reviewChargeVersions) {
    const startDate = reviewChargeVersion.chargePeriodStartDate
    const endDate = reviewChargeVersion.chargePeriodEndDate

    const dates = _prepareDate(startDate, endDate)
    chargePeriodDates.push(dates)
  }

  return chargePeriodDates
}

function _matchedReturns (returnLogs) {
  const matchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length > 0) {
      const { returnStatus, total } = _checkStatusAndReturnTotal(returnLog)

      matchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          status: returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          total,
          allocated: _allocated(returnLog)
        }
      )
    }
  }

  return matchedReturns
}

function _unmatchedReturns (returnLogs) {
  const unmatchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length < 1) {
      unmatchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          status: returnLog.returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          total: `${returnLog.quantity} ML`
        }
      )
    }
  }

  return unmatchedReturns
}

function _checkStatusAndReturnTotal (returnLog) {
  const { returnStatus: status, allocated, quantity, underQuery } = returnLog

  let total
  let returnStatus = underQuery ? 'query' : status

  if (status === 'void' || status === 'received') {
    total = '/'
  } else if (status === 'due') {
    returnStatus = 'overdue'
    total = '/'
  } else {
    total = `${allocated} ML / ${quantity} ML`
  }

  return { returnStatus, total }
}

function _allocated (returnLog) {
  const { quantity, allocated, status, underQuery } = returnLog
  if (underQuery) {
    return ''
  } else if (status === 'void' || status === 'received' || status === 'due') {
    return 'Not processed'
  } else if (quantity > allocated) {
    return 'Over abstraction'
  } else {
    return 'Fully allocated'
  }
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
