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
 * @param {object} licence - the mapped and validated licence to persist
 * @returns {Promise<module:LicenceModel>}
 */
async function go (licence) {
  const {
    expiredDate,
    lapsedDate,
    licenceRef,
    naldRegionId,
    regions,
    revokedDate,
    startDate,
    waterUndertaker
  } = licence

  const region = await RegionModel.query()
    .select(['id'])
    .where('naldRegionId', naldRegionId)
    .limit(1)
    .first()

  return LicenceModel.query()
    .insert({
      expiredDate,
      waterUndertaker,
      lapsedDate,
      licenceRef,
      regionId: region.id,
      regions,
      revokedDate,
      startDate,
      updatedAt: new Date().toISOString()
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
