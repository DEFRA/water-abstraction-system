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
    .select(
      'chargeVersionId', 'scheme', 'chargeVersions.startDate', 'endDate', 'licence.licenceId', 'licence.licenceRef'
    )
    .innerJoinRelated('licence')
    .where('scheme', 'sroc')
    .where('include_in_supplementary_billing', 'yes')
    .where('region_id', regionId)
    .where('chargeVersions.start_date', '>=', billingPeriod.startDate)
    .where('chargeVersions.start_date', '<=', billingPeriod.endDate)

  return chargeVersions
}

module.exports = {
  go
}
