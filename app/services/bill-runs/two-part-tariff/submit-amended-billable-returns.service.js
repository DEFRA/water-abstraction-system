'use strict'

/**
 *
 * @module SubmitAmendedBillableReturnsService
*/

const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 *
 * @param {*} reviewChargeElementId
 * @param {*} payload
 * @returns
 */
async function go (reviewChargeElementId, payload) {
  const { 'quantity-options': selectedOption } = payload

  const volume = selectedOption === 'customQuantity' ? payload.customQuantity : selectedOption

  return ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .patch({ allocated: volume })
}

module.exports = {
  go
}
