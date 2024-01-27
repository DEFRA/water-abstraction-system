'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceService
 */

const { db } = require('../../../db/db.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (id) {
  const licence = await _fetchLicence(id)

  const data = await _data(licence)

  return data
}

async function _data (licence) {
  return {
    ...licence,
    ends: licence.$ends(),
    licenceHolder: licence.$licenceHolder()
  }
}

async function _fetchLicence (id) {
  const result = await LicenceModel.query()
    .findById(id)
    .select([
      'licences.expiredDate',
      'licences.id',
      'licences.lapsedDate',
      'licences.licenceRef',
      'licences.revokedDate',
      'licences.startDate'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select([
        'licenceDocumentHeaders.id',
        'licenceDocumentHeaders.licenceName',
        'licenceEntityRoles.role',
        'licenceEntities.name'
      ])
        .leftJoin('licenceEntityRoles', function () {
          this
            .on('licenceEntityRoles.companyEntityId', '=', 'licenceDocumentHeaders.companyEntityId')
            .andOn('licenceEntityRoles.role', '=', db.raw('?', ['primary_user']))
        })
        .leftJoin('licenceEntities', 'licenceEntities.id', 'licenceEntityRoles.licenceEntityId')
    })
    .modify('licenceHolder')

  return result
}

module.exports = {
  go
}
