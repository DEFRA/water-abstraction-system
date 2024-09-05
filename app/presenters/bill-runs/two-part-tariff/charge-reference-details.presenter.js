'use strict'

/**
 * Formats the review charge reference data ready for presenting in the charge reference details page
 * @module ChargeReferenceDetailsPresenter
 */

const Big = require('big.js')

const { formatLongDate, formatFinancialYear } = require('../../base.presenter.js')

/**
 * Prepares and processes review charge reference data for presentation
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeReference} reviewChargeReference - the data from the review charge reference
 * @param {string} licenceId - the UUID of the licence the charge reference is linked to
 *
 * @returns {object} the prepared bill run and charge reference data to be passed to the charge reference details page
 */
function go (billRun, reviewChargeReference, licenceId) {
  const { hasAggregateOrChargeFactor, adjustments } = _adjustments(reviewChargeReference)

  return {
    billRunId: billRun.id,
    financialYear: formatFinancialYear(billRun.toFinancialYearEnding),
    chargePeriod: _prepareDate(
      reviewChargeReference.reviewChargeVersion.chargePeriodStartDate,
      reviewChargeReference.reviewChargeVersion.chargePeriodEndDate
    ),
    chargeReference: {
      id: reviewChargeReference.id,
      reference: reviewChargeReference.chargeReference.chargeCategory.reference,
      description: reviewChargeReference.chargeReference.chargeCategory.shortDescription,
      totalBillableReturns: _totalBillableReturns(reviewChargeReference.reviewChargeElements),
      authorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
      adjustments,
      additionalCharges: _additionalCharges(reviewChargeReference.chargeReference)
    },
    licenceId,
    hasAggregateOrChargeFactor
  }
}

function _additionalCharges (chargeReference) {
  const { supportedSourceName, waterCompanyCharge } = chargeReference

  const charges = []

  if (supportedSourceName) {
    charges.push(`Supported source ${supportedSourceName}`)
  }

  if (waterCompanyCharge) {
    charges.push('Public Water Supply')
  }

  return charges.join(', ')
}

function _adjustments (reviewChargeReference) {
  const {
    aggregate,
    amendedAggregate,
    chargeAdjustment,
    amendedChargeAdjustment,
    abatementAgreement,
    winterDiscount,
    twoPartTariffAgreement,
    canalAndRiverTrustAgreement
  } = reviewChargeReference

  const adjustments = []
  let hasAggregateOrChargeFactor = false

  if (amendedAggregate !== 1) {
    adjustments.push(`Aggregate factor (${amendedAggregate})`)
    hasAggregateOrChargeFactor = true
  }

  if (amendedChargeAdjustment !== 1) {
    adjustments.push(`Charge adjustment (${amendedChargeAdjustment})`)
    hasAggregateOrChargeFactor = true
  }

  if (abatementAgreement !== 1) {
    adjustments.push(`Abatement agreement (${abatementAgreement})`)
  }

  if (winterDiscount) {
    adjustments.push('Winter discount')
  }

  if (twoPartTariffAgreement) {
    adjustments.push('Two part tariff agreement')
  }

  if (canalAndRiverTrustAgreement) {
    adjustments.push('Canal and River trust agreement')
  }

  if (aggregate !== amendedAggregate || chargeAdjustment !== amendedChargeAdjustment) {
    hasAggregateOrChargeFactor = true
  }

  return { adjustments, hasAggregateOrChargeFactor }
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

function _totalBillableReturns (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    total = Big(total).plus(reviewChargeElement.amendedAllocated).toNumber()

    return total
  }, 0)
}

module.exports = {
  go
}
