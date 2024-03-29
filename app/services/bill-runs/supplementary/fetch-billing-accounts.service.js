'use strict'

/**
 * Fetches all billing accounts to be processed as part of supplementary billing for a region and billing period
 * @module FetchBillingAccountsService
 */

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Fetches all billing accounts to be processed as part of supplementary billing for a region and billing period
 *
 * To be selected for billing a billing account must
 *
 * - be linked to a licence which is linked to the selected region
 * - be linked to a licence flagged for SROC supplementary billing
 * - not be linked to a licence in the workflow
 * - be linked to a charge version which has the scheme 'sroc'
 * - be linked to a charge version which has a start date before the end of the billing period
 * - not be linked to a charge version which has a status of 'draft'
 *
 * @param {String} regionId - UUID of the region being billed that the licences must be linked to
 * @param {Object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<[module:BillingAccountModel]>} An array of `BillingAccountModel` to be billed and their relevant
 * licence, charge version, charge element etc records needed to generate the bill run
 */
async function go (regionId, billingPeriod) {
  return _fetch(regionId, billingPeriod)
}

async function _fetch (regionId, billingPeriod) {
  return BillingAccountModel.query()
    .select([
      'billingAccounts.id',
      'billingAccounts.accountNumber'
    ])
    .whereExists(_whereExistsClause(regionId, billingPeriod))
    .orderBy([
      { column: 'billingAccounts.accountNumber' }
    ])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder
        .select([
          'chargeVersions.id',
          'chargeVersions.scheme',
          'chargeVersions.startDate',
          'chargeVersions.endDate',
          'chargeVersions.billingAccountId',
          'chargeVersions.status'
        ])

      _whereClauseForChargeVersions(builder, regionId, billingPeriod)

      builder.orderBy([
        { column: 'licenceId', order: 'ASC' },
        { column: 'startDate', order: 'ASC' }
      ])
    })
    .withGraphFetched('chargeVersions.licence')
    .modifyGraph('chargeVersions.licence', (builder) => {
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
    .withGraphFetched('chargeVersions.licence.region')
    .modifyGraph('chargeVersions.licence.region', (builder) => {
      builder.select([
        'id',
        'chargeRegionId'
      ])
    })
    .withGraphFetched('chargeVersions.changeReason')
    .modifyGraph('chargeVersions.changeReason', (builder) => {
      builder.select([
        'id',
        'triggersMinimumCharge'
      ])
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', (builder) => {
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
    .withGraphFetched('chargeVersions.chargeReferences.chargeCategory')
    .modifyGraph('chargeVersions.chargeReferences.chargeCategory', (builder) => {
      builder.select([
        'id',
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })
}

function _whereClauseForChargeVersions (query, regionId, billingPeriod) {
  return query
    .innerJoinRelated('licence')
    .where('licence.regionId', regionId)
    .where('licence.includeInSrocBilling', true)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .whereNot('chargeVersions.status', 'draft')
    .whereNotExists(
      Workflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'workflows.licenceId')
        .whereNull('workflows.deletedAt')
    )
}

function _whereExistsClause (regionId, billingPeriod) {
  let query = ChargeVersionModel.query().select(1)

  query = _whereClauseForChargeVersions(query, regionId, billingPeriod)
  query.whereColumn('chargeVersions.billingAccountId', 'billingAccounts.id')

  return query
}

module.exports = {
  go
}
