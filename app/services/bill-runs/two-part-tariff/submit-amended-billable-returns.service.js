'use strict'

/**
 * Orchestrates validating and patching the data for the amend billable returns page
 * @module SubmitAmendedBillableReturnsService
*/

const AmendBillableReturnsPresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')
const BillableReturnsValidator = require('../../../validators/bill-runs/two-part-tariff/billable-returns.validator.js')
const FetchMatchDetailsService = require('./fetch-match-details.service.js')
const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Orchestrates validating the data for the amend billable returns page and patching the db value
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeElementId - The UUID of the review charge element being updated
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The updated value for the billable returns
 */
async function go (billRunId, licenceId, reviewChargeElementId, payload, yar) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _persistAmendedBillableReturns(reviewChargeElementId, payload)
    yar.flash('banner', 'The billable returns for this licence have been updated')

    return { error: null }
  }

  const { billRun, reviewChargeElement } = await FetchMatchDetailsService.go(billRunId, reviewChargeElementId)
  const pageData = AmendBillableReturnsPresenter.go(billRun, reviewChargeElement, licenceId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Set the billable returns quantity for this bill run',
    error: validationResult,
    customQuantitySelected: payload['quantity-options'] === 'customQuantity',
    customQuantityValue: payload.customQuantity,
    ...pageData
  }
}

function _persistAmendedBillableReturns (reviewChargeElementId, payload) {
  const volume = payload['quantity-options'] === 'customQuantity' ? payload.customQuantity : payload['quantity-options']

  return ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .patch({ amendedAllocated: volume })
}

function _validate (payload) {
  const validation = BillableReturnsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  const radioFormElement = payload['quantity-options'] === 'customQuantity' ? null : { text: message }
  const customQuantityInputFormElement = payload['quantity-options'] === 'customQuantity' ? { text: message } : null

  return {
    message,
    radioFormElement,
    customQuantityInputFormElement
  }
}

module.exports = {
  go
}
