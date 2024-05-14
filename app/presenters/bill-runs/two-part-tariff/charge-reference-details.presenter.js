'use strict'

/**
 * Formats the review charge reference data ready for presenting in the charge reference details page
 * @module ChargeReferenceDetailsPresenter
 */

const { formatLongDate, formatFinancialYear } = require('../../base.presenter.js')

/**
 * Prepares and processes review charge reference data for presentation
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeReference} reviewChargeReference - the data from the review charge reference
 * @param {String} licenceId - the UUID of the licence the charge reference is linked to
 *
 * @returns {Object} the prepared bill run and charge reference data to be passed to the charge reference details page
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
      reference: reviewChargeReference.chargeReference.chargeCategory.reference,
      description: reviewChargeReference.chargeReference.chargeCategory.shortDescription,
      totalBillableReturns: _totalBillableReturns(reviewChargeReference.reviewChargeElements),
      authorisedVolume: reviewChargeReference.chargeReference.volume,
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
  const adjustments = []
  let hasAggregateOrChargeFactor = false

  if (reviewChargeReference.amendedAggregate !== 1) {
    adjustments.push(`Aggregate factor (${reviewChargeReference.amendedAggregate})`)
    hasAggregateOrChargeFactor = true
  }

  if (reviewChargeReference.amendedChargeAdjustment !== 1) {
    adjustments.push(`Charge adjustment (${reviewChargeReference.amendedChargeAdjustment})`)
    hasAggregateOrChargeFactor = true
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

  return { adjustments, hasAggregateOrChargeFactor }
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
