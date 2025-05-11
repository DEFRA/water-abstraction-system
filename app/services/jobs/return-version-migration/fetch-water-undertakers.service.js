'use strict'

/**
 * Fetches all water undertakers that have a valid licence after 1/04/2025
 * @module FetchWaterUndertakersService
 */

const { db } = require('../../../../db/db.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

/**
 * Fetches all water undertaker licences that will have not been ended before 1/04/2025
 *
 * @returns {Promise<module:LicenceModel>} the matching licences
 */
async function go() {
  const quarterlyStartDate = new Date('2025-04-01')

  return await LicenceModel.query()
    .select([
      'id',
      'expiredDate',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate',
      'waterUndertaker',
      db.raw("regions->>'regionalChargeArea' as regionalChargeArea")
    ])
    .where('waterUndertaker', true)
    .where((builder) => {
      builder.whereNull('expiredDate').orWhere('expiredDate', '>=', quarterlyStartDate)
    })
    .where((builder) => {
      builder.whereNull('lapsedDate').orWhere('lapsedDate', '>=', quarterlyStartDate)
    })
    .where((builder) => {
      builder.whereNull('revokedDate').orWhere('revokedDate', '>=', quarterlyStartDate)
    })
    .whereNotExists(
      ReturnVersionModel.query()
        .where('returnVersions.status', 'current')
        .where('startDate', '>=', quarterlyStartDate)
        .whereColumn('returnVersions.licenceId', 'licences.id')
    )
    .whereExists(
      ReturnVersionModel.query()
        .where('returnVersions.status', 'current')
        .where('quarterlyReturns', false)
        .where('startDate', '<', quarterlyStartDate)
        .whereColumn('returnVersions.licenceId', 'licences.id')
    )
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder
        .select(['id', 'startDate', 'reason'])
        .where('startDate', '<', quarterlyStartDate)
        .where('status', 'current')
        // A return version must include return requirements in order for us to be able to copy from it
        .whereExists(
          ReturnRequirementModel.query()
            .select(1)
            .whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')
        )
        .orderBy('startDate', 'desc')
    })
}

module.exports = {
  go
}
