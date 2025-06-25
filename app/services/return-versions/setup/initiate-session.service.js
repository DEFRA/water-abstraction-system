'use strict'

/**
 * Initiates the session record used for setting up a new return requirement
 * @module InitiateSessionService
 */

const Boom = require('@hapi/boom')

const FetchLicenceService = require('./fetch-licence.service.js')
const SessionModel = require('../../../models/session.model.js')

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
 * @param {string} licenceId - the UUID of the licence the return requirement will be created for
 * @param {string} journey - whether the set up journey needed is 'no-returns-required' or 'returns-required'
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(licenceId, journey) {
  const licence = await FetchLicenceService.go(licenceId)

  if (!licence) {
    throw Boom.notFound('Licence for new return requirement not found', { id: licenceId })
  }

  const data = _data(licence, journey)

  return _createSession(data)
}

async function _createSession(data) {
  const session = await SessionModel.query()
    .insert({
      data
    })
    .returning('id')

  return session
}

function _data(licence, journey) {
  const { id, licenceRef, licenceVersions, returnVersions, startDate, waterUndertaker } = licence
  const ends = licence.$ends()

  return {
    checkPageVisited: false,
    licence: {
      id,
      currentVersionStartDate: _currentVersionStartDate(licenceVersions),
      endDate: ends ? ends.date : null,
      licenceRef,
      licenceHolder: licence.$licenceHolder(),
      returnVersions,
      startDate,
      waterUndertaker
    },
    multipleUpload: waterUndertaker,
    journey,
    requirements: [{}]
  }
}

function _currentVersionStartDate(licenceVersions) {
  // Extract the start date from the most 'current' licence version. _fetchLicence() ensures in the case
  // that there is more than one that they are ordered by their start date (DESC)
  const { startDate } = licenceVersions[0]

  return startDate
}

module.exports = {
  go
}
