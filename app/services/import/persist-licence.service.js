'use strict'

/**
 * Persists the licence
 * @module PersistLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')
const RegionModel = require('../../models/region.model.js')

/**
 * Saves the licence versions, purposes and conditions
 *
 * @param {object} licenceData - the mapped and validated licence to persist
 * @returns {Promise<module:LicenceModel>}
 */
async function go (licenceData) {
  const region = await RegionModel.query()
    .select(['id'])
    .where('naldRegionId', licenceData.regionId)
    .limit(1)
    .first()

  return LicenceModel.query()
    .insert({
      ...licenceData,
      regionId: region.id
    })
    .onConflict('licenceRef')
    .merge([
      'expiredDate',
      'lapsedDate',
      'regions',
      'revokedDate',
      'startDate',
      'updatedAt',
      'waterUndertaker'
    ])
}

module.exports = {
  go
}
