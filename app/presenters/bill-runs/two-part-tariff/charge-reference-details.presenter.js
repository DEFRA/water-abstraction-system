'use strict'

/**
 * Formats the review charge reference data ready for presenting in the charge reference details page
 * @module ChargeReferenceDetailsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes review charge reference data for presentation
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeReference} reviewChargeReference - the data from the review charge reference
 * @param {String} licenceId - the UUID of the licence the charge element is linked to
 *
 * @returns {Object} the prepared bill run and charge reference data to be passed to the charge reference details page
 */
function go (billRun, reviewChargeReference, licenceId) {
  return {
    billRunId: billRun.id,
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    chargePeriod: _prepareDate(
      reviewChargeReference.reviewChargeVersion.chargePeriodStartDate,
      reviewChargeReference.reviewChargeVersion.chargePeriodEndDate
    ),
    chargeReference: {
      reference: reviewChargeReference.chargeReference.chargeCategory.reference,
      description: reviewChargeReference.chargeReference.chargeCategory.shortDescription,
      totalBillableReturns: _totalBillableReturns(reviewChargeReference.reviewChargeElements),
      authorisedVolume: reviewChargeReference.chargeReference.volume,
      adjustments: {
        aggregateFactor: reviewChargeReference.amendedAggregate,
        chargeAdjustment: reviewChargeReference.amendedChargeAdjustment,
        winterDiscount: reviewChargeReference.winterDiscount ? '0.5' : '1'
      }
    },
    licenceId
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

function _totalBillableReturns (reviewChargeElements) {
  let totalBillableReturns = 0

  reviewChargeElements.forEach((reviewChargeElement) => {
    totalBillableReturns += reviewChargeElement.amendedAllocated
  })

  return totalBillableReturns
}

module.exports = {
  go
}
