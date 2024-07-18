'use strict'

/**
 * Persists the licence versions
 * @module PersistLicenceVersionsService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Saves the licence versions
 *
 * @param {LegacyLicenceVersionsArray} licenceVersions
 * @param {string} licenceId
 */
async function go (licenceVersions, licenceId) {
  const data = licenceVersions.map((version) => {
    return {
      ...version,
      licenceId
    }
  })

  return LicenceVersionModel.query()
    .insert(data)
    .onConflict('externalId')
    .merge([
      'licenceId',
      'status',
      'startDate',
      'endDate',
      'updatedAt'
    ])
}

module.exports = {
  go
}
