'use strict'

/**
 * Fetches SROC charge versions that might be included in a supplementary bill run
 * @module FetchChargeVersionsService
 */

const ChargeVersion = require('../../models/charge-version.model.js')

/**
 * Fetch all SROC charge versions linked to licences flagged for supplementary billing that are in the period being
 * billed
 *
 * > This is not the final form of the service. It is a 'work in progress' as we implement tickets that gradually
 * > build up our understanding of SROC supplementary billing
 *
 * @param {string} regionId GUID of the region which the licences will be linked to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns an array of Objects containing the relevant charge versions
 */
async function go (regionId, billingPeriod) {
  const chargeVersions = await _fetch(regionId, billingPeriod)

  return chargeVersions
}

async function _fetch (regionId, billingPeriod) {
  const chargeVersions = await ChargeVersion.query()
    .alias('cv')
    .select(
      'cv.chargeVersionId', 'cv.scheme', 'cv.startDate', 'cv.endDate', 'lic.licenceId', 'lic.licenceRef',
      'bcc.reference', 'cp.abstractionPeriodStartDay', 'cp.abstractionPeriodStartMonth', 'cp.abstractionPeriodEndDay',
      'cp.abstractionPeriodEndMonth'
    )
    .innerJoinRelated('licence as lic')
    .innerJoinRelated('billingChargeCategory as bcc')
    .innerJoinRelated('chargePurpose as cp')
    .where('cv.scheme', 'sroc')
    .where('lic.includeInSupplementaryBilling', 'yes')
    .where('lic.regionId', regionId)
    .where('cv.startDate', '>=', billingPeriod.startDate)
    .where('cv.startDate', '<=', billingPeriod.endDate)

  return chargeVersions
}

module.exports = {
  go
}
