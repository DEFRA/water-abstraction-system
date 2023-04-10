'use strict'

/**
 * Fetches replaced SROC charge versions that have not already been included in the billing batch being processed
 * @module FetchReplacedChargeVersionsService
 */

const ChargeVersion = require('../../models/water/charge-version.model.js')
const ChargeVersionWorkflow = require('../../models/water/charge-version-workflow.model.js')

/**
 * Fetch all 'replaced' (superseded) SROC charge versions linked to licences flagged for supplementary billing that are
 * in the period being billed
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
    .select([
      'chargeVersionId',
      'scheme',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'invoiceAccountId'
    ])
    .innerJoinRelated('licence')
    .where('scheme', 'sroc')
    .where('includeInSrocSupplementaryBilling', true)
    .where('regionId', regionId)
    .where('chargeVersions.status', 'superseded')
    .where('chargeVersions.startDate', '>=', billingPeriod.startDate)
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .whereNotExists(
      ChargeVersionWorkflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId')
    )
    .orderBy([
      { column: 'chargeVersions.invoiceAccountId' },
      { column: 'chargeVersions.licenceId' }
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', builder => {
      builder.select([
        'licenceId',
        'licenceRef'
      ])
    })

  return chargeVersions
}

module.exports = {
  go
}
