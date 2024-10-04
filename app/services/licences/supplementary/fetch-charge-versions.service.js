'use strict'

/**
 * Fetches the licence and charge version data for the given licenceId
 * @module FetchLicenceChargeVersionsService
 */

const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches and returns the charge versions, changed dates and the licence data.
 *
 * It determines which dates have changed by comparing the incoming dates from the
 * nald import to the dates we currently hold on the wrls licence
 * @param {string} wrlsLicenceId - The UUID of the licence being fetched
 *
 * @returns {Promise<object>} - The data needed to determine which supplementary flags the licence needs
 */
async function go (wrlsLicenceId) {
  const licence = await _fetchLicenceData(wrlsLicenceId)
  const chargeVersions = await _fetchChargeVersionsData(wrlsLicenceId)

  return { chargeVersions, licence }
}

async function _fetchChargeVersionsData (id) {
  return ChargeVersionModel.query()
    .select('id', 'startDate', 'endDate')
    .where('licenceId', id)
    .andWhere('startDate', '>=', '2022-04-01')
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

async function _fetchLicenceData (id) {
  return LicenceModel.query()
    .select([
      'licences.id',
      'licences.expiredDate',
      'licences.lapsedDate',
      'licences.revokedDate',
      'includeInSrocBilling',
      'includeInPresrocBilling'
    ])
    .distinctOn('licences.id')
    .where('licences.id', id)
    .leftJoin('chargeVersions as cv', 'licences.id', 'cv.licenceId')
    .modify((builder) => {
      builder.select(
        ChargeVersionModel.query()
          .count()
          .whereColumn('charge_versions.licenceId', 'licences.id')
          .andWhere('charge_versions.startDate', '<', '2022-04-01')
          .as('preSroc')
      )
    })
}

module.exports = {
  go
}
