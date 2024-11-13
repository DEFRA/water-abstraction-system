'use strict'

/**
 * Fetches SROC charge versions for two-part-tariff billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Fetches two-part tariff charge versions for the region and billing period being billed
 *
 * To be selected for billing charge versions must
 *
 * - have the scheme 'sroc'
 * - be linked to a licence with is linked to the selected region
 * - have a start date before the end of the billing period
 * - have an end date on or after the start of the billing period
 * - not be linked to a licence in the workflow
 * - not be linked to a licence that 'ended' before the billing period
 * - have a status of current
 * - be linked to a charge reference that is marked as two-part-tariff
 *
 * @param {string} regionId - UUID of the region being billed
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object>} Contains an array of two-part tariff charge versions with linked licences, charge
 * references, charge elements and related purpose
 */
async function go (regionId, billingPeriod) {
  return _fetch(regionId, billingPeriod)
}

async function _fetch (regionId, billingPeriod) {
  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.id',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.status'
    ])
    .innerJoinRelated('licence')
    .where('licence.regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
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
    .whereExists(
      ChargeReferenceModel.query()
        .select(1)
        .whereColumn('chargeVersions.id', 'chargeReferences.chargeVersionId')
        // NOTE: We can make withJsonSuperset() work which looks nicer, but only if we don't have anything camel case
        // in the table/column name. Camel case mappers don't work with whereJsonSuperset() or whereJsonSubset(). So,
        // rather than have to remember that quirk we stick with whereJsonPath() which works in all cases.
        .whereJsonPath('chargeReferences.adjustments', '$.s127', '=', true)
    )
    .orderBy('chargeVersions.licenceRef', 'asc')
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', (builder) => {
      builder.select([
        'description'
      ])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'licenceRef',
        'startDate',
        'expiredDate',
        'lapsedDate',
        'revokedDate'
      ])
        .modify('licenceHolder')
    })
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder
        .select([
          'id',
          'volume',
          'description',
          ref('chargeReferences.adjustments:aggregate').castFloat().as('aggregate'),
          ref('chargeReferences.adjustments:s126').castText().as('s126'),
          ref('chargeReferences.adjustments:s127').castText().as('s127'),
          ref('chargeReferences.adjustments:s130').castText().as('s130'),
          ref('chargeReferences.adjustments:winter').castText().as('winter'),
          ref('chargeReferences.adjustments:charge').castText().as('charge')
        ])
        .whereJsonPath('chargeReferences.adjustments', '$.s127', '=', true)
    })
    .withGraphFetched('chargeReferences.chargeCategory')
    .modifyGraph('chargeReferences.chargeCategory', (builder) => {
      builder
        .select([
          'reference',
          'shortDescription',
          'subsistenceCharge'
        ])
    })
    .withGraphFetched('chargeReferences.chargeElements')
    .modifyGraph('chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'id',
          'description',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'authorisedAnnualQuantity'
        ])
        .where('section127Agreement', true)
        .orderBy('authorisedAnnualQuantity', 'desc')
    })
    .withGraphFetched('chargeReferences.chargeElements.purpose')
    .modifyGraph('chargeReferences.chargeElements.purpose', (builder) => {
      builder
        .select([
          'id',
          'legacyId',
          'description'
        ])
    })

  return chargeVersions
}

module.exports = {
  go
}
