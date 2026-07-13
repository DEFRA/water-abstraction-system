/**
 * Orchestrates validating and patching the data for the amend billable returns page
 * @module SubmitEditService
 */

import EditPresenter from '../../../presenters/bill-runs/review/edit.presenter.js'
import EditValidator from '../../../validators/bill-runs/review/edit.validator.js'
import FetchReviewChargeElementService from './fetch-review-charge-element.service.js'
import ReviewChargeElementModel from '../../../models/review-charge-element.model.js'

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
export default async function (reviewChargeElementId, elementIndex, yar, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(reviewChargeElementId, payload)
    yar.flash('banner', 'The billable returns for this licence have been updated')

    return {}
  }

  const reviewChargeElement = await FetchReviewChargeElementService(reviewChargeElementId)
  const pageData = EditPresenter(reviewChargeElement, elementIndex)

  return {
    activeNavBar: 'bill-runs',
    customQuantitySelected: payload.quantityOptions === 'customQuantity',
    customQuantityValue: payload.customQuantity,
    error: validationResult,
    ...pageData
  }
}

function _save(reviewChargeElementId, payload) {
  const volume = payload.quantityOptions === 'customQuantity' ? payload.customQuantity : payload.quantityOptions

  return ReviewChargeElementModel.query().findById(reviewChargeElementId).patch({ amendedAllocated: volume })
}

function _validate(payload) {
  const validation = EditValidator(payload)

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
