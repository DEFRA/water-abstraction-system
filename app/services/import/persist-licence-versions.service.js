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

// old code

// const createLicenceVersion = `insert into water.licence_versions (
//     licence_id,
//     issue,
//     increment,
//     status,
//     start_date,
//     end_date,
//     external_id,
//     date_created,
//     date_updated
//   ) values ($1, $2, $3, $4, $5, $6, $7, now(), now()) on conflict (external_id) do update set
//     licence_id = excluded.licence_id,
//     status = excluded.status,
//     start_date = excluded.start_date,
//     end_date = excluded.end_date,
//     date_updated = now()
//   returning licence_version_id;`
