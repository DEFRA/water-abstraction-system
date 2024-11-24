'use strict'

/**
 * Orchestrates validating and patching the data for the amend billable returns page
 * @module SubmitEditService
 */

const EditPresenter = require('../../../presenters/bill-runs/review/edit.presenter.js')
const EditValidator = require('../../../validators/bill-runs/review/edit.validator.js')
const FetchReviewChargeElementService = require('./fetch-review-charge-element.service.js')
const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Orchestrates validating the data for the amend billable returns page and patching the db value
 *
 * @param {string} reviewChargeElementId - The UUID of the charge element being updated
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are editing to the one they selected on the review licence screen
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The updated value for the billable returns
 */
async function go(reviewChargeElementId, elementIndex, yar, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(reviewChargeElementId, payload)
    yar.flash('banner', 'The billable returns for this licence have been updated')

    return {}
  }

  const reviewChargeElement = await FetchReviewChargeElementService.go(reviewChargeElementId)
  const pageData = EditPresenter.go(reviewChargeElement, elementIndex)

  return {
    customQuantitySelected: payload.quantityOptions === 'customQuantity',
    customQuantityValue: payload.customQuantity,
    error: validationResult,
    pageTitle: 'Set the billable returns quantity for this bill run',
    ...pageData
  }
}

function _save(reviewChargeElementId, payload) {
  const volume = payload.quantityOptions === 'customQuantity' ? payload.customQuantity : payload.quantityOptions

  return ReviewChargeElementModel.query().findById(reviewChargeElementId).patch({ amendedAllocated: volume })
}

function _validate(payload) {
  const validation = EditValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  if (payload.quantityOptions === 'customQuantity') {
    return {
      errorList: [{ href: '#custom-quantity', text: message }],
      customQuantityErrorMessage: { text: message }
    }
  }

  return {
    errorList: [{ href: '#quantityOptions-error', text: message }],
    quantityOptionsErrorMessage: { text: message }
  }
}

module.exports = {
  go
}
