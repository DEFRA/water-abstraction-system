'use strict'

/**
 * Formats the charge element and returns data ready for presenting in the match details page
 * @module MatchDetailsPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review charge element and returns data for presentation
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeElement} reviewChargeElement - the data from the review charge element
 * @param {String} licenceId - the UUID of the licence the charge element is linked to
 *
 * @returns {Object} the prepared bill run and charge element data to be passed to the match details page
 */
function go (billRun, reviewChargeElement, licenceId) {
  return {
    billRunId: billRun.id,
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    chargePeriod: _prepareDate(
      reviewChargeElement.reviewChargeReference.reviewChargeVersion.chargePeriodStartDate,
      reviewChargeElement.reviewChargeReference.reviewChargeVersion.chargePeriodEndDate
    ),
    licenceId,
    chargeElement: {
      chargeElementId: reviewChargeElement.id,
      description: reviewChargeElement.chargeElement.description,
      dates: _prepareChargeElementDates(
        reviewChargeElement.chargeElement,
        reviewChargeElement.reviewChargeReference.reviewChargeVersion
      ),
      status: reviewChargeElement.status,
      billableVolume: reviewChargeElement.allocated,
      authorisedVolume: reviewChargeElement.chargeElement.authorisedAnnualQuantity,
      issues: reviewChargeElement.issues?.length > 0 ? reviewChargeElement.issues.split(', ') : []
    },
    matchedReturns: _matchedReturns(reviewChargeElement)
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _matchedReturns (reviewChargeElement) {
  const { reviewReturns } = reviewChargeElement
  const matchedReturns = []

  reviewReturns.forEach((reviewReturn) => {
    matchedReturns.push({
      returnId: reviewReturn.returnId,
      reference: reviewReturn.returnReference,
      dates: _prepareDate(reviewReturn.startDate, reviewReturn.endDate),
      purpose: reviewReturn.purposes[0]?.tertiary.description,
      description: reviewReturn.description,
      returnStatus: _returnStatus(reviewReturn),
      returnTotal: _returnTotal(reviewReturn),
      issues: reviewReturn.issues?.length > 0 ? reviewReturn.issues.split(', ') : ['']
    })
  })

  return matchedReturns
}

function _prepareChargeElementDates (chargeElement, chargeVersion) {
  const chargePeriod = {
    startDate: chargeVersion.chargePeriodStartDate,
    endDate: chargeVersion.chargePeriodEndDate
  }

  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  const dates = []

  // NOTE: There can be more than 1 abstraction period for an element, hence why we loop through them
  abstractionPeriods.forEach((abstractionPeriod) => {
    dates.push(_prepareDate(abstractionPeriod.startDate, abstractionPeriod.endDate))
  })

  return dates
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

function _returnStatus (returnLog) {
  if (returnLog.returnStatus === 'due') {
    return 'overdue'
  }

  if (returnLog.underQuery) {
    return 'query'
  }

  return returnLog.returnStatus
}

function _returnTotal (returnLog) {
  const { returnStatus, allocated, quantity } = returnLog

  if (['due', 'received', 'void'].includes(returnStatus)) {
    return '/'
  }

  return `${allocated} ML / ${quantity} ML`
}

module.exports = {
  go
}
