'use strict'

/**
 * Fetches SROC charge versions linked to licences flagged for inclusion in next SROC supplementary billing
 * @module FetchChargeVersionsService
 */

const { ref } = require('objection')

const ChargeVersion = require('../../models/water/charge-version.model.js')
const ChargeVersionWorkflow = require('../../models/water/charge-version-workflow.model.js')

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
async function go (regionId, billingPeriod) {
  const allChargeVersions = await _fetch(regionId, billingPeriod)

  return _extractLicenceIdsThenRemoveNonChargeableChargeVersions(allChargeVersions)
}

async function _fetch (regionId, billingPeriod) {
  const allChargeVersions = await ChargeVersion.query()
    .select([
      'chargeVersions.chargeVersionId',
      'chargeVersions.scheme',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.invoiceAccountId',
      'chargeVersions.status'
    ])
    .innerJoinRelated('licence')
    .where('licences.includeInSrocSupplementaryBilling', true)
    .where('licences.regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
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

  return allChargeVersions
}

/**
 * Extract the `licenceId`s from all the charge versions before removing non-chargeable charge versions
 *
 * When a licence is made "non-chargeable" the supplementary billing flag gets set and a charge version created that has
 * no `invoice_account_id`. For the purpose of billing we are not interested in non-chargeable charge versions. We are
 * interested in the associated licences to ensure that their supplementary billing flag is unset.
 */
function _extractLicenceIdsThenRemoveNonChargeableChargeVersions (allChargeVersions) {
  const licenceIdsForPeriod = []
  const chargeVersions = []

  for (const chargeVersion of allChargeVersions) {
    licenceIdsForPeriod.push(chargeVersion.licence.licenceId)

    if (chargeVersion.invoiceAccountId) {
      chargeVersions.push(chargeVersion)
    }
  }

  return { chargeVersions, licenceIdsForPeriod }
}

module.exports = {
  go
}
