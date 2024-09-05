'use strict'

/**
 * Orchestrates validating and patching the data for the amend authorised volume page
 * @module SubmitAmendedAuthorisedVolumeService
*/

const AmendAuthorisedVolumePresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-authorised-volume.presenter.js')
const AuthorisedVolumeValidator = require('../../../validators/bill-runs/two-part-tariff/authorised-volume.validator.js')
const FetchAuthorisedVolumeService = require('./fetch-authorised-volume.service.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Orchestrates validating the data for the amend authorised volume page and patching the db value
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being updated
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The updated value for the authorised volume
 */
async function go (billRunId, licenceId, reviewChargeReferenceId, payload, yar) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _persistAuthorisedVolume(reviewChargeReferenceId, payload)
    yar.flash('banner', 'The authorised volume for this licence have been updated')

    return { error: null }
  }

  const { billRun, reviewChargeReference } = await FetchAuthorisedVolumeService.go(billRunId, reviewChargeReferenceId)

  const pageData = AmendAuthorisedVolumePresenter.go(billRun, reviewChargeReference, licenceId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Set the authorised volume',
    error: validationResult,
    ...pageData
  }
}

async function _persistAuthorisedVolume (reviewChargeReferenceId, payload) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .patch({ amendedAuthorisedVolume: payload.authorisedVolume })
}

function _validate (payload) {
  const validation = AuthorisedVolumeValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const authorisedVolume = validation.error.details[0].message

  return {
    authorisedVolume
  }
}

module.exports = {
  go
}
