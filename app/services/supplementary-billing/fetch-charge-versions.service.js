'use strict'

/**
 * Fetches SROC charge versions linked to licences flagged for inclusion in next SROC supplementary billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeVersion = require('../../models/water/charge-version.model.js')
const ChargeVersionWorkflow = require('../../models/water/charge-version-workflow.model.js')

/**
 * Fetch all SROC charge versions linked to licences flagged for supplementary billing that are in the period being
 * billed
 *
 * @param {String} regionId UUID of the region being billed that the licences must be linked to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object[]} An array of matching charge versions
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
      'invoiceAccountId',
      'status'
    ])
    .innerJoinRelated('licence')
    .where('includeInSrocSupplementaryBilling', true)
    .where('regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
    .whereNotNull('chargeVersions.invoiceAccountId')
    .where('chargeVersions.startDate', '>=', billingPeriod.startDate)
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .whereNot('chargeVersions.status', 'draft')
    .whereNotExists(
      ChargeVersionWorkflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId')
        .whereNull('chargeVersionWorkflows.dateDeleted')
    )
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
        ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea'),
        'startDate',
        'expiredDate',
        'lapsedDate',
        'revokedDate'
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
