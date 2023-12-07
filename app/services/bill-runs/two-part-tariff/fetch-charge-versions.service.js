'use strict'

/**
 * Fetches SROC charge versions for two-part-tariff billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const RegionModel = require('../../../models/region.model.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Fetches SROC charge versions based on region and billing period
 *
 * To be selected for billing charge versions must
 *
 * - have the scheme 'sroc'
 * - be linked to a licence with is linked to the selected region
 * - have a start date before the end of the billing period
 * - not be linked to a licence in the workflow
 * - have a status of current
 * - be linked to a charge reference that is marked as two-part-tariff
 *
 * @param {String} regionId UUID of the region being billed that the charge version must have
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object} Contains an array of SROC charge versions with linked licences, charge references, charge elements and related purpose
 */
async function go (regionId, billingPeriod) {
  const regionCode = await _regionCode(regionId)

  return _fetch(regionCode, billingPeriod)
}

async function _fetch (regionCode, billingPeriod) {
  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.id',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.status'
    ])
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .where('chargeVersions.regionCode', regionCode)
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
    .orderBy('chargeVersions.licenceRef')
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
    })
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder
        .select([
          'id',
          'description',
          ref('chargeReferences.adjustments:aggregate').as('aggregate'),
          ref('chargeReferences.adjustments:s127').castText().as('s127')
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

async function _regionCode (regionId) {
  const { naldRegionId } = await RegionModel.query().findById(regionId).select('naldRegionId')

  return naldRegionId
}

module.exports = {
  go
}
