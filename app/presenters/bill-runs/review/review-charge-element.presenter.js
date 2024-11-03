'use strict'

/**
 * Formats the review charge element data ready for presenting in the review charge element page
 * @module ReviewChargeElementPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatAbstractionPeriod, formatFinancialYear, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the review charge element data ready for presenting in the review charge element page
 *
 * @param {module:ReviewChargeElement} reviewChargeElement - instance of the `ReviewChargeElementModel`
 * returned from `FetchReviewChargeElementService`
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are reviewing to the one they selected on the review licence screen
 *
 * @returns {object} page date needed for the review charge element page
 */
function go (reviewChargeElement, elementIndex) {
  const {
    amendedAllocated: billableReturns,
    chargeElement,
    id: reviewChargeElementId,
    issues,
    reviewChargeReference,
    status
  } = reviewChargeElement

  return {
    authorisedVolume: chargeElement.authorisedAnnualQuantity,
    billableReturns,
    chargeDescription: chargeElement.description,
    chargePeriod: reviewChargeReference.reviewChargeVersion.$formatChargePeriod(),
    chargePeriods: _chargePeriods(reviewChargeElement),
    elementCount: reviewChargeReference.reviewChargeElements.length,
    elementIndex,
    financialPeriod: formatFinancialYear(
      reviewChargeReference.reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding
    ),
    issues: issues.length > 0 ? issues.split(', ') : [],
    licenceId: reviewChargeReference.reviewChargeVersion.reviewLicence.licenceId,
    matchedReturns: _matchedReturns(reviewChargeElement.reviewReturns),
    reviewChargeElementId,
    reviewLicenceId: reviewChargeReference.reviewChargeVersion.reviewLicence.id,
    status
  }
}

function _chargePeriods (reviewChargeElement) {
  const { chargeElement, reviewChargeReference } = reviewChargeElement

  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  const { chargePeriodStartDate, chargePeriodEndDate } = reviewChargeReference.reviewChargeVersion

  const chargePeriod = { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate }

  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  return abstractionPeriods.map((abstractionPeriod) => {
    const { endDate, startDate } = abstractionPeriod

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  })
}

function _matchedReturns (reviewReturns) {
  return reviewReturns.map((reviewReturn) => {
    const { description, endDate, issues, purposes, returnLog, returnId, returnReference, startDate } = reviewReturn
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnLog

    return {
      abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
      description,
      issues: issues.length > 0 ? issues.split(', ') : [''],
      purpose: purposes[0].tertiary.description,
      reference: returnReference,
      returnId,
      returnLink: _returnLink(reviewReturn),
      returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      returnStatus: _returnStatus(reviewReturn),
      returnTotal: _returnTotal(reviewReturn)
    }
  })
}

function _returnLink (reviewReturn) {
  const { returnId, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return `/return/internal?returnId=${returnId}`
  }

  return `/returns/return?id=${returnId}`
}

function _returnStatus (reviewReturn) {
  const { returnStatus, underQuery } = reviewReturn

  if (returnStatus === 'due') {
    return 'overdue'
  }

  if (underQuery) {
    return 'query'
  }

  return reviewReturn.returnStatus
}

function _returnTotal (reviewReturn) {
  const { allocated, quantity, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return '/'
  }

  return `${allocated} ML / ${quantity} ML`
}

module.exports = {
  go
}
