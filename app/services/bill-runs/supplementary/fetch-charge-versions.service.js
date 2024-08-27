'use strict'

/**
 * Fetches SROC charge versions linked to licences flagged for inclusion in next SROC supplementary billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

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
 * need to know about them in order to unset the licence's sroc billing flag).
 *
 * @param {string} regionId - UUID of the region being billed that the licences must be linked to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object>} Contains an array of unique licence IDs and array of charge versions to be processed
 */
async function go (regionId, billingPeriod) {
  const allChargeVersions = await _fetch(regionId, billingPeriod)

  return _extractLicenceIdsThenRemoveNonChargeableChargeVersions(allChargeVersions)
}

async function _fetch (regionId, billingPeriod) {
  const allChargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.id',
      'chargeVersions.scheme',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.billingAccountId',
      'chargeVersions.status'
    ])
    .innerJoinRelated('licence')
    .where('licence.includeInSrocBilling', true)
    .where('licence.regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .whereNot('chargeVersions.status', 'draft')
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
    .modifyGraph('licence', (builder) => {
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
    .modifyGraph('licence.region', (builder) => {
      builder.select([
        'id',
        'chargeRegionId'
      ])
    })
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', (builder) => {
      builder.select([
        'triggersMinimumCharge'
      ])
    })
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
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
    .modifyGraph('chargeReferences.chargeCategory', (builder) => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeReferences.chargeElements')
    .modifyGraph('chargeReferences.chargeElements', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })

  return allChargeVersions
}

/**
 * Extract the `licenceId`s from all the charge versions before removing non-chargeable charge versions
 *
 * When a licence is made "non-chargeable" the supplementary billing flag gets set and a charge version created that
 * has no `invoice_account_id`. For the purpose of billing we are not interested in non-chargeable charge versions.
 * We are interested in the associated licences to ensure that their supplementary billing flag is unset.
 *
 * @private
 */
function _extractLicenceIdsThenRemoveNonChargeableChargeVersions (allChargeVersions) {
  const chargeVersions = []

  let licenceIdsForPeriod = []

  for (const chargeVersion of allChargeVersions) {
    licenceIdsForPeriod.push(chargeVersion.licence.id)

    if (chargeVersion.billingAccountId) {
      chargeVersions.push(chargeVersion)
    }
  }

  // NOTE: If a licence appears multiple times in the results it will be pushed multiple times into the array. We have
  // found a handy way to de-dupe an array of values is to create a new Set and then destructure it back to an array
  // of values.
  licenceIdsForPeriod = [...new Set(licenceIdsForPeriod)]

  return { chargeVersions, licenceIdsForPeriod }
}

module.exports = {
  go
}
