'use strict'

/**
 * Formats the charge element and returns data ready for presenting in the match details page
 * @module MatchDetailsPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatAbstractionPeriod, formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review charge element and returns data for presentation
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeElement} reviewChargeElement - the data from the review charge element
 * @param {string} licenceId - the UUID of the licence the charge element is linked to
 *
 * @returns {object} the prepared bill run and charge element data to be passed to the match details page
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
      billableVolume: reviewChargeElement.amendedAllocated,
      authorisedVolume: reviewChargeElement.chargeElement.authorisedAnnualQuantity,
      issues: reviewChargeElement.issues?.length > 0 ? reviewChargeElement.issues.split(', ') : []
    },
    matchedReturns: _matchedReturns(reviewChargeElement.reviewReturns)
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _prepareAbsPeriod (returnLog) {
  const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnLog

  return formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth)
}

function _matchedReturns (reviewReturns) {
  const matchedReturns = []

  reviewReturns.forEach((returnLog) => {
    const { returnLink, returnTotal } = _returnLinkAndTotal(returnLog)

    matchedReturns.push({
      returnId: returnLog.returnId,
      reference: returnLog.returnReference,
      dates: _prepareDate(returnLog.startDate, returnLog.endDate),
      purpose: returnLog.purposes[0]?.tertiary.description,
      description: returnLog.description,
      returnStatus: _returnStatus(returnLog),
      returnTotal,
      issues: returnLog.issues?.length > 0 ? returnLog.issues.split(', ') : [''],
      returnLink,
      absPeriod: _prepareAbsPeriod(returnLog.returnLog)
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

function _returnLinkAndTotal (returnLog) {
  const { returnStatus, allocated, quantity } = returnLog

  if (['due', 'received', 'void'].includes(returnStatus)) {
    return { returnTotal: '/', returnLink: `/return/internal?returnId=${returnLog.returnId}` }
  }

  return { returnTotal: `${allocated} ML / ${quantity} ML`, returnLink: `/returns/return?id=${returnLog.returnId}` }
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

module.exports = {
  go
}
