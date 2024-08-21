'use strict'

/**
 * Calculates the charge for a charge reference to display in a banner to the user
 * @module CalculateChargeService
 */

const { ref } = require('objection')

const CalculateChargeRequest = require('../../../requests/charging-module/calculate-charge.request.js')
const { formatChargingModuleDate, formatMoney } = require('../../../presenters/base.presenter.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Calculates the charge for a charge reference to display in a banner to the user
 *
 * It does this by sending a transaction based on the selected charge reference to the charging module so that it can
 * calculate the charge. The charge amount is then added to a flash message which will be displayed to the user.
 *
 * @param {string} licenceId - The UUID of the licence related to the charge
 * @param {string} reviewChargeReferenceId - The UUID of the charge reference review data to calculate the charge on
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go (licenceId, reviewChargeReferenceId, yar) {
  const reviewChargeReference = await _fetchReviewChargeReference(reviewChargeReferenceId)
  const waterUndertaker = await _fetchWaterUndertaker(licenceId)
  const calculatedCharge = await _calculateCharge(reviewChargeReference, waterUndertaker)

  if (calculatedCharge) {
    yar.flash('charge', `Based on this information the example charge is ${formatMoney(calculatedCharge)}.`)
  }
}

function _calculateActualVolume (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    total += reviewChargeElement.amendedAllocated

    return total
  }, 0)
}

async function _calculateCharge (reviewChargeReference, waterUndertaker) {
  const transaction = {
    abatementFactor: reviewChargeReference.abatementAgreement,
    actualVolume: _calculateActualVolume(reviewChargeReference.reviewChargeElements),
    adjustmentFactor: reviewChargeReference.amendedChargeAdjustment,
    aggregateProportion: reviewChargeReference.amendedAggregate,
    authorisedDays: 0, // 2PT uses volumes in the calculations rather than days so this can be set to 0
    authorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
    billableDays: 0, // 2PT uses volumes in the calculations rather than days so this can be set to 0
    chargeCategoryCode: reviewChargeReference.chargeReference.chargeCategory.reference,
    compensationCharge: false, // Always false for the two-part tariff annual
    credit: false,
    loss: reviewChargeReference.chargeReference.loss,
    periodStart: formatChargingModuleDate(reviewChargeReference.reviewChargeVersion.chargePeriodStartDate),
    periodEnd: formatChargingModuleDate(reviewChargeReference.reviewChargeVersion.chargePeriodEndDate),
    ruleset: 'sroc',
    section127Agreement: reviewChargeReference.twoPartTariffAgreement,
    section130Agreement: reviewChargeReference.canalAndRiverTrustAgreement,
    supportedSource: reviewChargeReference.chargeReference.supportedSourceName !== null,
    // If `supportedSource` is `true` then `supportedSourceName` must be present
    supportedSourceName: reviewChargeReference.chargeReference.supportedSourceName,
    // If `twoPartTariff` is `true` then `section127Agreement` must also be `true`
    twoPartTariff: reviewChargeReference.twoPartTariffAgreement,
    waterCompanyCharge: reviewChargeReference.chargeReference.waterCompanyCharge !== null,
    waterUndertaker,
    winterOnly: reviewChargeReference.winterDiscount
  }

  const calculatedCharge = await CalculateChargeRequest.send(transaction)

  if (calculatedCharge.succeeded) {
    return calculatedCharge.response.body.calculation.chargeValue
  } else {
    return null
  }
}

async function _fetchReviewChargeReference (reviewChargeReferenceId) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .select(
      'abatementAgreement',
      'amendedAggregate',
      'amendedAuthorisedVolume',
      'amendedChargeAdjustment',
      'canalAndRiverTrustAgreement',
      'twoPartTariffAgreement',
      'winterDiscount'
    )
    .withGraphFetched('chargeReference')
    .modifyGraph('chargeReference', (builder) => {
      builder.select(
        'loss',
        ref('chargeReferences.additionalCharges:supportedSource.name').castText().as('supportedSourceName'),
        ref('chargeReferences.additionalCharges:isSupplyPublicWater').castText().as('waterCompanyCharge')
      )
    })
    .withGraphFetched('chargeReference.chargeCategory')
    .modifyGraph('chargeReference.chargeCategory', (builder) => {
      builder.select('reference')
    })
    .withGraphFetched('reviewChargeVersion')
    .modifyGraph('reviewChargeVersion', (builder) => {
      builder.select('chargePeriodStartDate', 'chargePeriodEndDate')
    })
    .withGraphFetched('reviewChargeElements')
    .modifyGraph('reviewChargeElements', (builder) => {
      builder.select('amendedAllocated')
    })
}

async function _fetchWaterUndertaker (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select('waterUndertaker')

  return licence.waterUndertaker
}

module.exports = {
  go
}
