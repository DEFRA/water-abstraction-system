'use strict'

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

async function go (billRunId) {
  return BillingAccountModel.query()
    .select([
      'billingAccounts.id',
      'billingAccounts.accountNumber'
    ])
    .whereExists(_whereBillingAccountExistsClause(billRunId))
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
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.chargeVersionId', 'chargeVersions.id')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
        .orderBy([
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
        'chargeReferences.id',
        'chargeReferences.source',
        'chargeReferences.loss',
        'chargeReferences.volume',
        'chargeReferences.adjustments',
        'chargeReferences.additionalCharges',
        'chargeReferences.description'
      ])
        .innerJoin('reviewChargeReferences', 'reviewChargeReferences.chargeReferenceId', 'chargeReferences.id')
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
    })
    .withGraphFetched('chargeVersions.chargeReferences.reviewChargeReferences')
    .modifyGraph('chargeVersions.chargeReferences.reviewChargeReferences', (builder) => {
      builder.select([
        'reviewChargeReferences.id',
        'reviewChargeReferences.amendedAggregate',
        'reviewChargeReferences.amendedChargeAdjustment',
        'reviewChargeReferences.amendedAuthorisedVolume'
      ])
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
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
        'chargeElements.id',
        'chargeElements.abstractionPeriodStartDay',
        'chargeElements.abstractionPeriodStartMonth',
        'chargeElements.abstractionPeriodEndDay',
        'chargeElements.abstractionPeriodEndMonth'
      ])
        .innerJoin('reviewChargeElements', 'reviewChargeElements.chargeElementId', 'chargeElements.id')
        .innerJoin('reviewChargeReferences', 'reviewChargeReferences.id', 'reviewChargeElements.reviewChargeReferenceId')
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements.reviewChargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements.reviewChargeElements', (builder) => {
      builder.select([
        'reviewChargeElements.id',
        'reviewChargeElements.amendedAllocated'
      ])
        .innerJoin('reviewChargeReferences', 'reviewChargeReferences.id', 'reviewChargeElements.reviewChargeReferenceId')
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
    })
}

function _whereBillingAccountExistsClause (billRunId) {
  const query = ChargeVersionModel.query().select(1)

  query
    .innerJoin('reviewChargeVersions', 'reviewChargeVersions.chargeVersionId', 'chargeVersions.id')
    .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
    .whereColumn('chargeVersions.billingAccountId', 'billingAccounts.id')
    .where('reviewLicences.billRunId', billRunId)

  return query
}

module.exports = {
  go
}
