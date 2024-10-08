'use strict'

/**
 * Fetches the licence and charge version data for the given licenceId
 * @module FetchLicenceChargeVersionsService
 */

const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

const SROC = new Date('2022-04-01')

/**
 * I am a comment
 * @param {*} id
 * @param {*} earliestDate
 * @returns
 */
async function go (id, earliestDate) {
  return await _fetchChargeVersions(id, earliestDate)
}

async function _fetchChargeVersions (id, earliestDate) {
  return ChargeVersionModel.query()
    .where('licenceId', id)
    .where('startDate', '>=', SROC)
    .where((builder) => {
      builder
        .whereNull('endDate')
        .orWhere('endDate', '>=', earliestDate)
    })
    .modify((builder) => {
      builder.select(
        ChargeVersionModel.relatedQuery('chargeReferences')
          .join('chargeElements as ce', 'ce.chargeReferenceId', 'chargeReferences.id')
          .where('chargeVersions.id', ChargeVersionModel.ref('chargeReferences.chargeVersionId'))
          .andWhere('ce.section127Agreement', true)
          .andWhere(ChargeReferenceModel.raw("charge_references.adjustments->>'s127' = 'true'"))
          .limit(1)
          .select(ChargeReferenceModel.raw('EXISTS(SELECT 1)'))
          .as('twoPartTariff')
      )
    })
}

module.exports = {
  go
}
