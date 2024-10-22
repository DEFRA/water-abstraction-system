'use strict'

/**
 * Initiates the session record used for setting up a new return requirement
 * @module InitiateSessionService
 */

const Boom = require('@hapi/boom')

const LicenceModel = require('../../../models/licence.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
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
 * @param {string} licenceId - the ID of the licence the return requirement will be created for
 * @param {string} journey - whether the set up journey needed is 'no-returns-required' or 'returns-required'
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go (licenceId, journey) {
  const licence = await _fetchLicence(licenceId)

  const data = _data(licence, journey)

  return _createSession(data)
}

async function _createSession (data) {
  const session = await SessionModel.query()
    .insert({
      data
    })
    .returning('id')

  return session
}

function _data (licence, journey) {
  const { id, licenceRef, licenceVersions, returnVersions, startDate } = licence
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
      startDate
    },
    journey,
    requirements: [{}]
  }
}

async function _fetchLicence (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'expiredDate',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate'
    ])
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder
        .select([
          'id',
          'startDate'
        ])
        .where('status', 'current')
        .orderBy('startDate', 'desc')
    })
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder
        .select([
          'id',
          'startDate',
          'reason'
        ])
        .where('status', 'current')
        // A return version must include return requirements in order for us to be able to copy from it
        .whereExists(
          ReturnRequirementModel.query()
            .select(1)
            .whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')
        )
        .orderBy('startDate', 'desc')
    })
    .withGraphFetched('returnVersions.modLogs')
    .modifyGraph('returnVersions.modLogs', (builder) => {
      builder
        .select([
          'id',
          'reasonDescription'
        ])
        .orderBy('externalId', 'asc')
    })
    // See licence.model.js `static get modifiers` if you are unsure about what this is doing
    .modify('licenceHolder')

  if (!licence) {
    throw Boom.notFound('Licence for new return requirement not found', { id: licenceId })
  }

  return licence
}

function _currentVersionStartDate (licenceVersions) {
  // Extract the start date from the most 'current' licence version. _fetchLicence() ensures in the case
  // that there is more than one that they are ordered by their start date (DESC)
  const { startDate } = licenceVersions[0]

  return startDate
}

module.exports = {
  go
}
