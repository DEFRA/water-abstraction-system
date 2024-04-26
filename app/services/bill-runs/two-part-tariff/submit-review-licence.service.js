'use strict'

/**
 * Handles updating a review licence record when the progress or status buttons are clicked
 * @module SubmitReviewLicenceService
 */

const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Handles updating a review licence record when the progress or status buttons are clicked
 *
 * The progress button in the two-part tariff review licence screen toggles whether a licence is 'in-progress' or not.
 *
 * The status button toggles whether a licence is 'ready' or in 'review'.
 *
 * We update the `ReviewLicenceModel` record and set a `flash()` message in the session so that when the request is
 * redirected to the `GET` it knows to display a notification banner to confirm that the progress or status has changed
 * to the user.
 *
 * @param {module:BillRunModel} billRunId - The UUID for the bill run
 * @param {module:LicenceModel} licenceId - The UUID of the licence that is being reviewed
 * @param {Object} payload - The Hapi `request.payload` object passed on by the controller
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} resolves to the result of the update query. Not intended to be used
 */
async function go (billRunId, licenceId, payload, yar) {
  const parsedPayload = _parsePayload(payload)

  // NOTE: The YarPlugin decorates the Hapi request object with a yar property. Yar is a session manager
  _bannerMessage(yar, parsedPayload)

  return _update(billRunId, licenceId, parsedPayload)
}

function _bannerMessage (yar, parsedPayload) {
  const { progress, status } = parsedPayload

  if (status) {
    yar.flash('banner', `Licence changed to ${status}.`)
    return
  }

  if (progress) {
    yar.flash('banner', 'This licence has been marked.')
    return
  }

  yar.flash('banner', 'The progress mark for this licence has been removed.')
}

function _parsePayload (payload) {
  const markProgress = payload['mark-progress'] ?? null
  const licenceStatus = payload['licence-status'] ?? null

  return {
    progress: markProgress === 'mark',
    status: licenceStatus
  }
}

async function _update (billRunId, licenceId, parsedPayload) {
  const { progress, status } = parsedPayload
  const patch = {}

  if (status) {
    patch.status = status
  } else {
    patch.progress = progress
  }

  return ReviewLicenceModel.query()
    .patch(patch)
    .where('billRunId', billRunId)
    .andWhere('licenceId', licenceId)
}

module.exports = {
  go
}
