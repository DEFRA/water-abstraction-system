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
    .select('chargeVersionId', 'scheme', 'chargeVersions.startDate', 'chargeVersions.endDate')
    .innerJoinRelated('licence')
    .where('scheme', 'sroc')
    .where('includeInSupplementaryBilling', 'yes')
    .where('regionId', regionId)
    .where('chargeVersions.startDate', '>=', billingPeriod.startDate)
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .withGraphFetched('licence')
    .modifyGraph('licence', builder => {
      builder.select(
        'licenceId',
        'licenceRef'
      )
    })
    .withGraphFetched('chargeElements.chargePurposes')
    .modifyGraph('chargeElements', builder => {
      builder.select(
        'chargeElementId'
      )
    })
    .modifyGraph('chargeElements.chargePurposes', builder => {
      builder.select(
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      )
    })
    .withGraphFetched('chargeElements.billingChargeCategory')
    .modifyGraph('chargeElements.billingChargeCategory', builder => {
      builder.select(
        'reference'
      )
    })

    console.log(chargeVersions)
    console.log(chargeVersions[0].chargeElements[0])

  return chargeVersions
}

module.exports = {
  go
}
