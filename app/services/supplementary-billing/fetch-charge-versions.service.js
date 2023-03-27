'use strict'

const { ref } = require('objection')
/**
 * Fetches SROC charge versions that might be included in a supplementary bill run
 * @module FetchChargeVersionsService
 */

const ChargeVersion = require('../../models/water/charge-version.model.js')
const ChargeVersionWorkflow = require('../../models/water/charge-version-workflow.model.js')

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
    .select([
      'chargeVersionId',
      'scheme',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'invoiceAccountId'
    ])
    .innerJoinRelated('licence')
    .where('scheme', 'sroc')
    .where('includeInSupplementaryBilling', 'yes')
    .where('regionId', regionId)
    .where('chargeVersions.status', 'current')
    .where('chargeVersions.startDate', '>=', billingPeriod.startDate)
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .whereNotExists(ChargeVersionWorkflow.query().select(1).whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId'))
    .orderBy([
      { column: 'chargeVersions.invoiceAccountId' },
      { column: 'chargeVersions.licenceId' }
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', builder => {
      builder.select([
        'licenceId',
        'licenceRef',
        'isWaterUndertaker',
        ref('licences.regions:historicalAreaCode').castText().as('historicalAreaCode'),
        ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea')
      ])
    })
    .withGraphFetched('licence.region')
    .modifyGraph('licence.region', builder => {
      builder.select([
        'regionId',
        'chargeRegionId'
      ])
    })
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', builder => {
      builder.select([
        'triggersMinimumCharge'
      ])
    })
    .withGraphFetched('chargeElements')
    .modifyGraph('chargeElements', builder => {
      builder.select([
        'chargeElementId',
        'source',
        'loss',
        'volume',
        'adjustments',
        'additionalCharges',
        'description'
      ])
    })
    .withGraphFetched('chargeElements.billingChargeCategory')
    .modifyGraph('chargeElements.billingChargeCategory', builder => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeElements.chargePurposes')
    .modifyGraph('chargeElements.chargePurposes', builder => {
      builder.select([
        'chargePurposeId',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })

  return chargeVersions
}

module.exports = {
  go
}
