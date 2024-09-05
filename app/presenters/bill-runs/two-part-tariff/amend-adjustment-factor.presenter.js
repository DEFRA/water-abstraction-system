'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the amend adjustment factor page
 * @module AmendAdjustmentFactorPresenter
 */

const { formatLongDate, formatFinancialYear } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review charge reference data for presenting
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeReference} reviewChargeReference - the data from the review charge reference
 * @param {string} licenceId - the UUID of the licence being reviewed
 *
 * @returns {object} the prepared bill run and charge reference data to be passed to the amend adjustment factor page
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
      aggregateFactor: reviewChargeReference.amendedAggregate === 0 ? '0' : reviewChargeReference.amendedAggregate,
      chargeAdjustment: reviewChargeReference.amendedChargeAdjustment === 0 ? '0' : reviewChargeReference.amendedChargeAdjustment,
      otherAdjustments: _otherAdjustments(reviewChargeReference)
    }
  }
}

function _otherAdjustments (reviewChargeReference) {
  const { supportedSourceName, waterCompanyCharge } = reviewChargeReference.chargeReference

  const adjustments = []

  if (supportedSourceName) {
    adjustments.push(`Supported source ${supportedSourceName}`)
  }

  if (waterCompanyCharge) {
    adjustments.push('Public Water Supply')
  }

  if (reviewChargeReference.abatementAgreement !== 1) {
    adjustments.push(`Abatement agreement (${reviewChargeReference.abatementAgreement})`)
  }

  if (reviewChargeReference.winterDiscount) {
    adjustments.push('Winter discount')
  }

  if (reviewChargeReference.twoPartTariffAgreement) {
    adjustments.push('Two part tariff agreement')
  }

  if (reviewChargeReference.canalAndRiverTrustAgreement) {
    adjustments.push('Canal and River trust agreement')
  }

  return adjustments
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
