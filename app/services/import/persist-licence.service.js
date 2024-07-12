'use strict'

/**
 * Persists the licence
 * @module PersistLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')
const RegionModel = require('../../models/region.model.js')

async function go (licence) {
  const {
    licence: {
      regionCode,
      licenceRef,
      waterUndertaker,
      regions,
      startDate,
      expiredDate,
      lapsedDate,
      revokedDate
    }
  } = licence

  // TODO: can this be eager
  const region = await RegionModel.query().select([
    'id'
  ]).where('naldRegionId', regionCode).limit(1).first()

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
      // TODO: this has been added, is it needed ?
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
