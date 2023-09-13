'use strict'

/**
 * Fetches SROC charge informations linked to licences flagged for inclusion in next SROC supplementary billing
 * @module FetchChargeInformationsService
 */

const { ref } = require('objection')

const ChargeInformation = require('../../../models/water/charge-information.model.js')
const ChargeVersionWorkflow = require('../../../models/water/charge-version-workflow.model.js')

/**
 * Fetch all SROC charge informations to be processed as part of supplementary billing
 *
 * To be selected for billing charge informations must
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
 * @returns {Object} Contains an array of unique licence IDs and array of charge informations to be processed
 */
async function go (regionId, billingPeriod) {
  const allChargeInformations = await _fetch(regionId, billingPeriod)

  return _extractLicenceIdsThenRemoveNonChargeableChargeInformations(allChargeInformations)
}

async function _fetch (regionId, billingPeriod) {
  const allChargeInformations = await ChargeInformation.query()
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
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', builder => {
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
    .withGraphFetched('chargeReferences.chargeCategory')
    .modifyGraph('chargeReferences.chargeCategory', builder => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeReferences.chargePurposes')
    .modifyGraph('chargeReferences.chargePurposes', builder => {
      builder.select([
        'chargePurposeId',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })

  return allChargeInformations
}

/**
 * Extract the `licenceId`s from all the charge informations before removing non-chargeable charge informations
 *
 * When a licence is made "non-chargeable" the supplementary billing flag gets set and a charge information created that
 * has no `invoice_account_id`. For the purpose of billing we are not interested in non-chargeable charge informations.
 * We are interested in the associated licences to ensure that their supplementary billing flag is unset.
 */
function _extractLicenceIdsThenRemoveNonChargeableChargeInformations (allChargeInformations) {
  const licenceIdsForPeriod = []
  const chargeInformations = []

  for (const chargeInformation of allChargeInformations) {
    licenceIdsForPeriod.push(chargeInformation.licence.licenceId)

    if (chargeInformation.invoiceAccountId) {
      chargeInformations.push(chargeInformation)
    }
  }

  return { chargeInformations, licenceIdsForPeriod }
}

module.exports = {
  go
}
