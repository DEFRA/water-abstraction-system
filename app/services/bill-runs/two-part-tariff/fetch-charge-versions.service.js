'use strict'

/**
 * Fetches SROC charge versions linked to licences flagged for inclusion in next SROC supplementary billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeReferenceModel = require('../../../models/water/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/water/charge-version.model.js')
const Workflow = require('../../../models/water/workflow.model.js')

/**
 * Fetch all SROC charge versions to be processed as part of supplementary billing
 *
 * To be selected for billing charge versions must
 *
 * - be linked to a licence flagged for supplementary billing
 * - be linked to a licence which is linked to the selected region
 * - have the scheme 'sroc'
 * - have a start date before the end of the billing period
 * - not have a status of draft
 * - not be linked to a licence in the workflow
 *
 * From this initial result we extract an array of unique licence IDs and then remove any that are non-chargeable (we
 * need to know about them in order to unset the licence's supplementary billing flag).
 *
 * @param {String} regionId UUID of the region being billed that the licences must be linked to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object} Contains an array of unique licence IDs and array of charge versions to be processed
 */
async function go (regionCode, billingPeriod, licenceId) {
  return _fetch(regionCode, billingPeriod, licenceId)
}

async function _fetch (regionCode, billingPeriod, licenceId) {
  const whereClause = {
    field: licenceId ? 'licenceId' : 'regionCode',
    value: licenceId ?? regionCode
  }

  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.chargeVersionId',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.status'
    ])
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .where(`chargeVersions.${whereClause.field}`, whereClause.value)
    .whereNotExists(
      Workflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId')
        .whereNull('chargeVersionWorkflows.dateDeleted')
    )
    .whereExists(
      ChargeReferenceModel.query()
        .select(1)
        .whereColumn('chargeVersions.chargeVersionId', 'chargeReferences.chargeVersionId')
        // NOTE: We can make withJsonSuperset() work which looks nicer, but only if we don't have anything camel case
        // in the table/column name. Camel case mappers don't work with whereJsonSuperset() or whereJsonSubset(). So,
        // rather than have to remember that quirk we stick with whereJsonPath() which works in all cases.
        .whereJsonPath('chargeReferences.adjustments', '$.s127', '=', true)
    )
    .orderBy('chargeVersions.licenceRef')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'licenceId',
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
          'chargeElementId',
          'description',
          ref('chargeElements.adjustments:aggregate').as('aggregate'),
          ref('chargeElements.adjustments:s127').castText().as('s127')
        ])
        .whereJsonPath('chargeElements.adjustments', '$.s127', '=', true)
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
          'chargePurposeId',
          'description',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'authorisedAnnualQuantity'
        ])
        .where('isSection127AgreementEnabled', true)
        .orderBy('authorisedAnnualQuantity', 'desc')
    })
    .withGraphFetched('chargeReferences.chargeElements.purpose')
    .modifyGraph('chargeReferences.chargeElements.purpose', (builder) => {
      builder
        .select([
          'purposeUseId',
          'legacyId',
          'description'
        ])
    })

  return chargeVersions
}

module.exports = {
  go
}
