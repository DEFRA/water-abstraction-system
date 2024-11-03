'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 * @module ReviewChargeReferencePresenter
 */

const Big = require('big.js')

const { formatFinancialYear } = require('../../base.presenter.js')

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 *
 * @param {module:ReviewChargeReferenceModel} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference page
 */
function go (reviewChargeReference) {
  const {
    amendedAuthorisedVolume,
    chargeReference,
    reviewChargeElements,
    reviewChargeVersion,
    id: reviewChargeReferenceId
  } = reviewChargeReference

  return {
    additionalCharges: _additionalCharges(chargeReference),
    adjustments: _adjustments(reviewChargeReference),
    amendedAuthorisedVolume,
    canAmend: _canAmend(reviewChargeReference),
    chargeCategory: chargeReference.chargeCategory.reference,
    chargeDescription: chargeReference.chargeCategory.shortDescription,
    chargePeriod: reviewChargeVersion.$formatChargePeriod(),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    reviewChargeReferenceId,
    reviewLicenceId: reviewChargeVersion.reviewLicence.id,
    totalBillableReturns: _totalBillableReturns(reviewChargeElements)
  }
}

function _additionalCharges (chargeReference) {
  const { supportedSourceName, waterCompanyCharge } = chargeReference

  const additionalCharges = []

  if (supportedSourceName) {
    additionalCharges.push(`Supported source ${supportedSourceName}`)
  }

  if (waterCompanyCharge) {
    additionalCharges.push('Public Water Supply')
  }

  return additionalCharges.join(', ')
}

function _adjustments (reviewChargeReference) {
  const {
    abatementAgreement,
    aggregate,
    amendedAggregate,
    amendedChargeAdjustment,
    canalAndRiverTrustAgreement,
    chargeAdjustment,
    twoPartTariffAgreement,
    winterDiscount
  } = reviewChargeReference

  const adjustments = []

  if (aggregate !== 1) {
    adjustments.push(`Aggregate factor (${amendedAggregate})`)
  }

  if (chargeAdjustment !== 1) {
    adjustments.push(`Charge adjustment (${amendedChargeAdjustment})`)
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

  return adjustments
}

function _canAmend (reviewChargeReference) {
  const { aggregate, chargeAdjustment } = reviewChargeReference

  return (aggregate !== 1 || chargeAdjustment !== 1)
}

function _totalBillableReturns (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    const { amendedAllocated } = reviewChargeElement

    return Big(total).plus(amendedAllocated).toNumber()
  }, 0)
}

module.exports = {
  go
}
