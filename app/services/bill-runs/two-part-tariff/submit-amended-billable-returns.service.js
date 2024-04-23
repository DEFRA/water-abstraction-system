'use strict'

/**
 * Orchestrates patching the data for the amend billable returns page
 * @module SubmitAmendedBillableReturnsService
*/

const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Orchestrates validating the data for the amend billable returns page and patching the db value
 *
 * @param {String} reviewChargeElementId - The UUID of the review charge element being updated
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The updated value for the billable returns
 */
async function go (reviewChargeElementId, payload) {
  const volume = payload['quantity-options'] === 'customQuantity' ? payload.customQuantity : payload['quantity-options']

  return ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .patch({ allocated: volume })
}

module.exports = {
  go
}
