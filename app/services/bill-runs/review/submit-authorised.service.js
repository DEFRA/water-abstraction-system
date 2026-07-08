/**
 * Handles user submission for the review charge reference authorised page
 * @module SubmitAuthorisedService
 */

import AuthorisedPresenter from '../../../presenters/bill-runs/review/authorised.presenter.js'
import AuthorisedValidator from '../../../validators/bill-runs/review/authorised.validator.js'
import FetchReviewChargeReferenceService from './fetch-review-charge-reference.service.js'
import ReviewChargeReferenceModel from '../../../models/review-charge-reference.model.js'

/**
 * Orchestrates validating the data for the amend authorised volume page and patching the db value
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being updated
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the page including the
 * validation error details
 */
export default async function go(reviewChargeReferenceId, yar, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(reviewChargeReferenceId, payload)
    yar.flash('banner', 'The authorised volume for this licence have been updated')

    return {}
  }

  const reviewChargeReference = await FetchReviewChargeReferenceService(reviewChargeReferenceId)
  const pageData = AuthorisedPresenter(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    amendedAuthorisedVolume: payload.amendedAuthorisedVolume,
    error: validationResult,
    ...pageData
  }
}

async function _save(reviewChargeReferenceId, payload) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .patch({ amendedAuthorisedVolume: payload.amendedAuthorisedVolume })
}

function _validate(payload) {
  const validation = AuthorisedValidator(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}
