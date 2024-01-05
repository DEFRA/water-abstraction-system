'use strict'

/**
 * Initiates the session record used for setting up a new return requirement
 * @module InitiateReturnRequirementSessionService
 */

const Boom = require('@hapi/boom')
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
 * @returns {String} the ID of the newly created session record
 */
async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)

  const data = _data(licence)

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

function _data (licence) {
  const { id, licenceRef } = licence

  return {
    licence: {
      id,
      licenceRef
    }
  }
}

async function _fetchLicence (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select(['id', 'licenceRef'])

  if (!licence) {
    throw Boom.notFound('Licence for new return requirement not found', { id: licenceId })
  }

  return licence
}

module.exports = {
  go
}
