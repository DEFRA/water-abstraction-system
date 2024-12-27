'use strict'

/**
 * Calculates the charge for a charge reference for preview by a user on the review charge reference page
 * @module PreviewService
 */

const { formatChargingModuleDate, formatMoney } = require('../../../presenters/base.presenter.js')
const CalculateChargeRequest = require('../../../requests/charging-module/calculate-charge.request.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Calculates the charge for a charge reference for preview by a user on the review charge reference page
 *
 * It does this by sending a transaction based on the selected charge reference to the charging module so that it can
 * calculate the charge. The charge amount is then added to a flash message which will be displayed to the user.
 *
 * If nothing has been allocated to the review charge reference (total billable returns is 0) then the service skips
 * sending the request and just returns £0.00.
 *
 * If the request is sent but does not succeed, we display the message returned in order to help us diagnose what the
 * issue could be.
 *
 * @param {string} reviewChargeReferenceId - The UUID of the charge reference review data to calculate the charge for
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(reviewChargeReferenceId, yar) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)
  const transaction = _transaction(reviewChargeReference)

  const result = await _calculateCharge(transaction)

  if (result.charge || result.charge === 0) {
    yar.flash('charge', `Based on this information the example charge is ${formatMoney(result.charge)}`)
  }

  yar.flash('charge', `Could not calculate a charge. ${result.message}.`)
}

function _actualVolume(reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    total += reviewChargeElement.amendedAllocated

    return total
  }, 0)
}

async function _calculateCharge(transaction) {
  if (transaction.actualVolume === 0) {
    return { charge: 0 }
  }

  const result = await CalculateChargeRequest.send(transaction)

  if (result.succeeded) {
    return { charge: result.response.body.calculation.chargeValue }
  }

  return { message: result.response.body.message }
}

function _transaction(reviewChargeReference) {
  const {
    abatementAgreement: abatementFactor,
    amendedAggregate: aggregateProportion,
    amendedAuthorisedVolume: authorisedVolume,
    amendedChargeAdjustment: adjustmentFactor,
    canalAndRiverTrustAgreement: section130Agreement,
    chargeReference,
    reviewChargeElements,
    reviewChargeVersion,
    twoPartTariffAgreement: section127Agreement,
    winterDiscount: winterOnly
  } = reviewChargeReference

  return {
    abatementFactor,
    actualVolume: _actualVolume(reviewChargeElements),
    adjustmentFactor,
    aggregateProportion,
    authorisedDays: 0, // 2PT uses volumes in the calculations rather than days so this can be set to 0
    authorisedVolume,
    billableDays: 0, // 2PT uses volumes in the calculations rather than days so this can be set to 0
    chargeCategoryCode: chargeReference.chargeCategory.reference,
    compensationCharge: false, // Always false for the two-part tariff annual
    credit: false,
    loss: chargeReference.loss,
    periodStart: formatChargingModuleDate(reviewChargeVersion.chargePeriodStartDate),
    periodEnd: formatChargingModuleDate(reviewChargeVersion.chargePeriodEndDate),
    ruleset: 'sroc',
    section127Agreement,
    section130Agreement,
    supportedSource: chargeReference.supportedSourceName !== null,
    // If `supportedSource` is `true` then `supportedSourceName` must be present
    supportedSourceName: chargeReference.supportedSourceName,
    // If `twoPartTariff` is `true` then `section127Agreement` must also be `true`
    twoPartTariff: section127Agreement,
    waterCompanyCharge: !!chargeReference.waterCompanyCharge,
    waterUndertaker: reviewChargeVersion.reviewLicence.licence.waterUndertaker,
    winterOnly
  }
}

module.exports = {
  go
}
