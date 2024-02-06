'use strict'

/**
 * Fetches SROC billing accounts linked to licences for annual billing
 * @module FetchBillingAccountsService
 */

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

async function go (regionId, billingPeriod) {
  const allBillingAccounts = await _fetchNew(regionId, billingPeriod)

  return allBillingAccounts
}

async function _fetchNew (regionId, billingPeriod) {
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
    .modifyGraph('chargeVersions', builder => {
      builder
        .select([
          'id',
          'scheme',
          'startDate',
          'endDate',
          'billingAccountId',
          'status'
        ])
        .where('scheme', 'sroc')
        .where('startDate', '<=', billingPeriod.endDate)
        .where('status', 'current')
        .where((builder) => {
          builder
            .whereNull('endDate')
            .orWhere('endDate', '>=', billingPeriod.startDate)
        })
        .orderBy([
          { column: 'licenceId', order: 'ASC' },
          { column: 'startDate', order: 'ASC' }
        ])
    })
    .withGraphFetched('chargeVersions.licence')
    .modifyGraph('chargeVersions.licence', builder => {
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
    .modifyGraph('chargeVersions.licence.region', builder => {
      builder.select([
        'id',
        'chargeRegionId'
      ])
    })
    .withGraphFetched('chargeVersions.changeReason')
    .modifyGraph('chargeVersions.changeReason', builder => {
      builder.select([
        'id',
        'triggersMinimumCharge'
      ])
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', builder => {
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
    .modifyGraph('chargeVersions.chargeReferences.chargeCategory', builder => {
      builder.select([
        'id',
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', builder => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })
}

function _whereExistsClause (regionId, billingPeriod) {
  return ChargeVersionModel.query()
    .select(1)
    .innerJoinRelated('licence')
    .where('licence.regionId', regionId)
    .whereColumn('chargeVersions.billingAccountId', 'billingAccounts.id')
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
}

module.exports = {
  go
}
