'use strict'

/**
 * Orchestrates validating and patching the data for the amend billable returns page
 * @module SubmitAmendedBillableReturnsService
*/

const AmendBillableReturnsService = require('../../../services/bill-runs/two-part-tariff/amend-billable-returns.service.js')
const BillableReturnsValidator = require('../../../validators/bill-runs/two-part-tariff/billable-returns.validator.js')
const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Orchestrates validating the data for the amend billable returns page and patching the db value
 *
 * @param {String} billRunId - The UUID for the bill run
 * @param {String} licenceId - The UUID of the licence that is being reviewed
 * @param {String} reviewChargeElementId - The UUID of the review charge element being updated
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The updated value for the billable returns
 */
async function go (billRunId, licenceId, reviewChargeElementId, payload) {
  const validationResult = await _validate(payload)

  if (!validationResult) {
    await _persistAmendedBillableReturns(reviewChargeElementId, payload)

    return { error: null }
  }

  const pageData = await AmendBillableReturnsService.go(billRunId, licenceId, reviewChargeElementId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Set the billable returns quantity for this bill run',
    error: validationResult,
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

  if (payload['quantity-options'] === 'customQuantity') {
    return {
      message,
      radioFormElement: null,
      customQuantityInputFormElement: { text: message }
    }
  }

  return {
    message,
    radioFormElement: { text: message },
    customQuantityInputFormElement: null
  }
}

module.exports = {
  go
}
