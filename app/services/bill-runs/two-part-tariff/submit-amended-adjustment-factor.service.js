'use strict'

/**
 * Orchestrates validating and patching the data for the amend adjustment factors page
 * @module SubmitAmendedAdjustmentFactorService
*/

const AdjustmentFactorValidator = require('../../../validators/bill-runs/two-part-tariff/adjustment-factor.validator.js')
const AmendAdjustmentFactorPresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-adjustment-factor.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Orchestrates validating the data for the amend adjustment factor page and patching the db value

 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being updated
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The updated value for the adjustment factor
 */
async function go (billRunId, licenceId, reviewChargeReferenceId, payload, yar) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _persistAmendedAdjustmentFactor(reviewChargeReferenceId, payload)
    yar.flash('banner', 'The adjustment factors for this licence have been updated')

    return { error: null }
  }

  const pageData = await _getPageData(billRunId, reviewChargeReferenceId, licenceId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Set the adjustment factors',
    error: validationResult,
    inputtedAggregateValue: payload.amendedAggregateFactor,
    inputtedChargeValue: payload.amendedChargeAdjustment,
    ...pageData
  }
}

async function _getPageData (billRunId, reviewChargeReferenceId, licenceId) {
  const {
    billRun,
    reviewChargeReference
  } = await FetchReviewChargeReferenceService.go(billRunId, reviewChargeReferenceId)

  return AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)
}

async function _persistAmendedAdjustmentFactor (reviewChargeReferenceId, payload) {
  await ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .patch({ amendedAggregate: payload.amendedAggregateFactor })

  await ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .patch({ amendedChargeAdjustment: payload.amendedChargeAdjustment })
}

function _validate (payload) {
  const maxDecimalsForAggregateValue = 15
  const maxDecimalsForChargeAdjustmentValue = 15

  const aggregateValidation = AdjustmentFactorValidator.go(
    payload.amendedAggregateFactor,
    maxDecimalsForAggregateValue,
    'aggregate')

  const chargeValidation = AdjustmentFactorValidator.go(
    payload.amendedChargeAdjustment,
    maxDecimalsForChargeAdjustmentValue,
    'charge')

  if (!aggregateValidation.error && !chargeValidation.error) {
    return null
  }

  return {
    aggregateFactorElement: aggregateValidation.error ? { text: aggregateValidation.error.details[0].message } : null,
    chargeAdjustmentElement: chargeValidation.error ? { text: chargeValidation.error.details[0].message } : null
  }
}

module.exports = {
  go
}
