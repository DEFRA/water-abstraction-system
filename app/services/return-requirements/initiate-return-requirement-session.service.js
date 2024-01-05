'use strict'

/**
 * Initiates the session record used for setting up a new return requirement
 * @module InitiateReturnRequirementSessionService
 */

const LicenceModel = require('../../../app/models/licence.model.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Initiates the session record using for setting up a new return requirement
 *
 * During the setup journey for a new return requirement we temporarily store the data in a `SessionModel` instance. It
 * is expected that on each page of the journey the GET will fetch the session record and use it to populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the return requirement and
 * the session record itself deleted.
 *
 * @param {String} licenceId - the ID of the licence the return requirement will be created for
 *
 * @returns {StringId} the ID of the newly created session record
 */
async function go (licenceId) {
  const data = { licence: await _licenceDetails(licenceId) }

  const sessionId = await _createSession(data)

  return sessionId
}

async function _createSession (data) {
  const session = await SessionModel.query()
    .insert({
      data
    })
    .returning('*')

  return session.id
}

async function _licenceDetails (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')

  return {
    licenceId,
    licenceRef: licence.licenceRef
  }
}

module.exports = {
  go
}
