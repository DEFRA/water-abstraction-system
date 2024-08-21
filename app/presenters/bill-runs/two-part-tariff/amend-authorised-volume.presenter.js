'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the amend authorised volume page
 * @module AmendAuthorisedVolumePresenter
 */

const { formatLongDate, formatFinancialYear } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review charge reference data for presenting
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeReference} reviewChargeReference - the data from the review charge reference
 * @param {string} licenceId - the UUID of the licence being reviewed
 *
 * @returns {object} the prepared bill run and charge reference data to be passed to the amend authorised volume page
 */
function go (billRun, reviewChargeReference, licenceId) {
  return {
    billRunId: billRun.id,
    licenceId,
    financialYear: formatFinancialYear(billRun.toFinancialYearEnding),
    chargePeriod: _prepareDate(
      reviewChargeReference.reviewChargeVersion.chargePeriodStartDate,
      reviewChargeReference.reviewChargeVersion.chargePeriodEndDate
    ),
    chargeReference: {
      id: reviewChargeReference.id,
      description: reviewChargeReference.chargeReference.chargeCategory.shortDescription,
      authorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
      totalBillableReturns: _totalBillableReturns(reviewChargeReference.reviewChargeElements)
    },
    chargeCategory: {
      minVolume: reviewChargeReference.chargeReference.chargeCategory.minVolume,
      maxVolume: reviewChargeReference.chargeReference.chargeCategory.maxVolume
    }
  }
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

function _totalBillableReturns (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    total += reviewChargeElement.amendedAllocated

    return total
  }, 0)
}

module.exports = {
  go
}
