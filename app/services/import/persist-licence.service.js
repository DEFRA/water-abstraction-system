'use strict'

/**
 * Persists the licence
 * @module PersistLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')
const RegionModel = require('../../models/region.model.js')

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
      'waterUndertaker',
      'lapsedDate',
      'licenceRef',
      'regionId',
      'regions',
      'revokedDate',
      'startDate',
      'updatedAt'
    ])
}

module.exports = {
  go
}
