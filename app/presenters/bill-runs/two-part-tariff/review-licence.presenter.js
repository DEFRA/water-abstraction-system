'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review licence data for presentation
 *
 * @param {module:ReviewReturnModel} matchedReturns matched return logs for an individual licence
 * @param {module:ReviewReturnModel} unmatchedReturns unmatched return logs for an individual licence
 * @param {Object[]} chargePeriods chargePeriods with start and end date properties
 * @param {module:BillRunModel} billRun the data from the bill run
 * @param {String} licenceRef the reference for the licence
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review licence page
 */
function go (matchedReturns, unmatchedReturns, chargePeriods, billRun, licenceRef) {
  return {
    licenceRef,
    billRunId: billRun.id,
    status: 'review',
    region: billRun.region.displayName,
    matchedReturns: _prepareMatchedReturns(matchedReturns),
    unmatchedReturns: _prepareUnmatchedReturns(unmatchedReturns),
    chargePeriodDates: _prepareLicenceChargePeriods(chargePeriods)
  }
}

function _prepareLicenceChargePeriods (chargePeriods) {
  return chargePeriods.map((chargePeriod) => {
    const { startDate, endDate } = chargePeriod

    return _prepareDate(startDate, endDate)
  })
}

function _prepareUnmatchedReturns (unmatchedReturns) {
  return unmatchedReturns.map((unmatchedReturn) => {
    const { returnReference, status, description, purposes, quantity, startDate, endDate } = unmatchedReturn.reviewReturns

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status,
      description,
      purpose: purposes[0].tertiary.description,
      total: `${quantity} ML`
    }
  })
}

function _prepareMatchedReturns (matchedReturns) {
  return matchedReturns.map((matchedReturn) => {
    const { returnStatus, total } = _checkStatusAndReturnTotal(matchedReturn)
    const { returnReference, description, purposes, startDate, endDate } = matchedReturn.reviewReturns

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status: returnStatus,
      description,
      purpose: purposes[0].tertiary.description,
      total,
      allocated: _allocated(matchedReturn)
    }
  })
}

function _checkStatusAndReturnTotal (returnLog) {
  const { status, allocated, quantity, underQuery } = returnLog.reviewReturns

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
  const { quantity, allocated, status, underQuery } = returnLog.reviewReturns
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
