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
  const { id, licenceRef, licenceDocument } = licence

  return {
    licence: {
      id,
      licenceRef,
      licenceHolder: _licenceHolder(licenceDocument)
    }
  }
}

async function _fetchLicence (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
    .withGraphFetched('licenceDocument')
    .modifyGraph('licenceDocument', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('licenceDocument.licenceDocumentRoles')
    .modifyGraph('licenceDocument.licenceDocumentRoles', (builder) => {
      builder
        .select([
          'licenceDocumentRoles.id'
        ])
        .innerJoinRelated('licenceRole')
        .where('licenceRole.name', 'licenceHolder')
        .orderBy('licenceDocumentRoles.createdAt', 'desc')
    })
    .withGraphFetched('licenceDocument.licenceDocumentRoles.company')
    .modifyGraph('licenceDocument.licenceDocumentRoles.company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('licenceDocument.licenceDocumentRoles.contact')
    .modifyGraph('licenceDocument.licenceDocumentRoles.contact', (builder) => {
      builder.select([
        'id',
        'contactType',
        'dataSource',
        'department',
        'firstName',
        'initials',
        'lastName',
        'middleInitials',
        'salutation',
        'suffix'
      ])
    })

  if (!licence) {
    throw Boom.notFound('Licence for new return requirement not found', { id: licenceId })
  }

  return licence
}

function _licenceHolder (licenceDocument) {
  // Extract the company and contact from the last licenceDocumentRole created. _fetchLicence() ensures in the case
  // that there is more than one that they are ordered by their created date
  const { company, contact } = licenceDocument.licenceDocumentRoles[0]

  if (contact) {
    return contact.$name()
  }

  return company.name
}

module.exports = {
  go
}
