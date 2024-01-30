'use strict'

/**
 * Fetches SROC charge versions linked to licences for annual billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Fetch all SROC charge versions to be processed as part of annual billing
 *
 * To be selected for billing charge versions must
 *
 * - be linked to a licence which is linked to the selected region
 * - have the scheme 'sroc'
 * - have a start date before the end of the billing period
 * - not have a status of draft
 * - not have a null billing account ID (these are created when the licence becomes non-chargeable)
 * - not be linked to a licence in the workflow
 *
 * @param {String} regionId UUID of the region being billed that the licences must be linked to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<Object>} Resolves to an array of charge versions to be processed
 */
async function go (regionId, billingPeriod) {
  const allChargeVersions = await _fetch(regionId, billingPeriod)

  return allChargeVersions
}

async function _fetch (regionId, billingPeriod) {
  return ChargeVersionModel.query()
    .select([
      'chargeVersions.id',
      'chargeVersions.scheme',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.billingAccountId',
      'chargeVersions.status'
    ])
    .innerJoinRelated('licence')
    .where('licence.regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .whereNotNull('chargeVersions.billingAccountId')
    .where((builder) => {
      builder
        .whereNull('chargeVersions.endDate')
        .orWhere('chargeVersions.endDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.expiredDate')
        .orWhere('licence.expiredDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.lapsedDate')
        .orWhere('licence.lapsedDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.revokedDate')
        .orWhere('licence.revokedDate', '>=', billingPeriod.startDate)
    })
    .whereNotExists(
      Workflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'workflows.licenceId')
        .whereNull('workflows.deletedAt')
    )
    .orderBy([
      { column: 'chargeVersions.billingAccountId' },
      { column: 'chargeVersions.licenceId' }
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', builder => {
      builder.select([
        'id',
        'licenceRef',
        'waterUndertaker',
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
        'id',
        'chargeRegionId'
      ])
    })
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', builder => {
      builder.select([
        'triggersMinimumCharge'
      ])
    })
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', builder => {
      builder.select([
        'id',
        'source',
        'loss',
        'volume',
        'adjustments',
        'additionalCharges',
        'description'
      ])
    })
    .withGraphFetched('chargeReferences.chargeCategory')
    .modifyGraph('chargeReferences.chargeCategory', builder => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeReferences.chargeElements')
    .modifyGraph('chargeReferences.chargeElements', builder => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })
}

module.exports = {
  go
}
