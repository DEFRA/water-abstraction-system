'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares the processes the bill run and review licence data for presentation
 *
 * @param {module:ReviewReturnResultModel} matchedReturns matched return logs for an individual licence
 * @param {module:ReviewReturnResultModel} unmatchedReturns unmatched return logs for an individual licence
 * @param {Object[]} chargePeriods chargePeriods with start and end date properties
 * @param {module:BillRunModel} billRun the data from the bill run
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review licence page
 */
async function go (matchedReturns, unmatchedReturns, chargePeriods, billRun) {
  return {
    licenceRef: matchedReturns[0].licence.licenceRef,
    billRunId: billRun.id,
    status: 'Review',
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
    const { returnReference, status, description, purposes, allocated, quantity, startDate, endDate } = unmatchedReturn.reviewReturnResults

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status,
      description,
      purpose: purposes[0].tertiary.description,
      total: `${allocated} ML / ${quantity} ML`
    }
  })
}

function _prepareMatchedReturns (matchedReturns) {
  return matchedReturns.map((matchedReturn) => {
    const { returnStatus, total, allocated } = _checkStatusAndReturnTotal(matchedReturn)
    const { returnReference, description, purposes, startDate, endDate } = matchedReturn.reviewReturnResults

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status: returnStatus,
      description,
      purpose: purposes[0].tertiary.description,
      total,
      allocated
    }
  })
}

function _checkStatusAndReturnTotal (returnLog) {
  const { status, allocated, quantity, underQuery } = returnLog.reviewReturnResults

  let returnStatus = underQuery ? 'query' : status
  let total = `${allocated} ML / ${quantity} ML`
  let allocatedStatus = _allocated(quantity, allocated)

  if (status === 'void' || status === 'received') {
    total = '/'
    allocatedStatus = 'Not processed'
  } else if (status === 'due') {
    returnStatus = 'overdue'
    total = '/'
    allocatedStatus = 'Not processed'
  }

  return { returnStatus, total, allocated: allocatedStatus }
}

function _allocated (quantity, allocated) {
  if (quantity > allocated) {
    return 'Over abstraction'
  } else if (quantity === allocated) {
    return 'Fully allocated'
  } else {
    return ''
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
