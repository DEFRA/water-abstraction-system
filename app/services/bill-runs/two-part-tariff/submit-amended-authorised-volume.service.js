'use strict'

/**
 * Orchestrates validating and patching the data for the amend billable returns page
 * @module SubmitAmendedAuthorisedVolumeService
*/

const AmendAuthorisedVolumePresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-authorised-volume.presenter.js')
const AuthorisedVolumeValidator = require('../../../validators/bill-runs/two-part-tariff/authorised-volume.validator.js')
const FetchAuthorisedVolumeService = require('./fetch-authorised-volume.service.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

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

function _persistAuthorisedVolume (reviewChargeReferenceId, payload) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .patch({ amendedAuthorisedVolume: payload.authorisedVolume })
}

function _validate (payload) {
  const validation = AuthorisedVolumeValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]
  const authorisedVolume = message

  return {
    message,
    authorisedVolume
  }
}

module.exports = {
  go
}
