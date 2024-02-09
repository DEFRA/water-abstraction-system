'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceService
 */

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
    licenceHolder: licence.$licenceHolder(),
    licenceName: licence.$licenceName() ?? 'Unregistered licence',
    registeredTo: licence.$registeredTo() ?? null
  }
}

async function _fetchLicence (id) {
  const result = await LicenceModel.query()
    .findById(id)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
    .withGraphFetched('licenceDocumentHeader')
    .withGraphFetched('licenceVersions.[licenceVersionPurposes, purposes]')
    .modify('licenceHolder')
    .modify('registeredToAndLicenceName')

  return result
}

module.exports = {
  go
}
