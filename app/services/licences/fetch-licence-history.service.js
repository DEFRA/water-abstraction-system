'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchLicenceHistoryService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the licence and related charge, licence and return versions
 */
async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)

  const chargeVersions = licence.chargeVersions
  const licenceVersions = licence.licenceVersions
  const returnVersions = licence.returnVersions

  return {
    entries: {
      chargeVersions,
      licenceVersions,
      returnVersions
    },
    licence: {
      id: licence.id,
      licenceRef: licence.licenceRef
    }
  }
}

async function _fetchLicence (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder.select(
        'chargeVersions.id',
        'chargeVersions.createdAt'
      )
        .modify('history')
    })
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder.select(
        'licenceVersions.id',
        'licenceVersions.createdAt'
      )
        .modify('history')
    })
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder.select(
        'returnVersions.id',
        'returnVersions.createdAt'
      )
        .modify('history')
    })
}

module.exports = {
  go
}
