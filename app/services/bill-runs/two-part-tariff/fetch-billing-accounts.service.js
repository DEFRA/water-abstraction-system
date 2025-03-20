'use strict'

/**
 * Fetches all billing accounts linked to a bill run to be processed as part of annual two-part tariff billing
 * @module FetchBillingAccountsService
 */

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

/**
 * Fetches all billing accounts linked to a bill run to be processed as part of annual two-part tariff billing
 *
 * Unlike regular annual and supplementary, when we come to generate the bill run the licences that will be in it have
 * already been determined. This is because they first would have gone through 'review' after the match & allocate
 * engine had compared their charge information to the return submissions.
 *
 * The complexity is we are having to go `billing account -> charge version -> review licence -> bill run ID` in order
 * to filter them.
 *
 * Once we've got them, we then need to get each level of charge information and their associated review records. We can
 * then combine the source charge information with the result of review in order to generate the transactions.
 *
 * That information is extracted in `ProcessBillingPeriodService` though. This just focuses on fetching the data.
 *
 * @param {string} billRunId - The UUID of the annual two-part tariff bill run to fetch billing accounts for
 *
 * @returns {Promise<module:BillingAccountModel[]>} An array of `BillingAccountModel` to be billed and their relevant
 * licence, charge version, charge element etc records, plus the two-part tariff review details needed to generate the
 * bill run
 */
async function go(billRunId) {
  return BillingAccountModel.query()
    .select(['billingAccounts.id', 'billingAccounts.accountNumber'])
    .whereExists(_whereBillingAccountExistsClause(billRunId))
    .orderBy([{ column: 'billingAccounts.accountNumber' }])
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
      builder.select(['id', 'chargeRegionId'])
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', (builder) => {
      builder
        .select([
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
      builder
        .select([
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
      builder.select(['id', 'reference', 'shortDescription'])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'chargeElements.id',
          'chargeElements.abstractionPeriodStartDay',
          'chargeElements.abstractionPeriodStartMonth',
          'chargeElements.abstractionPeriodEndDay',
          'chargeElements.abstractionPeriodEndMonth'
        ])
        .innerJoin('reviewChargeElements', 'reviewChargeElements.chargeElementId', 'chargeElements.id')
        .innerJoin(
          'reviewChargeReferences',
          'reviewChargeReferences.id',
          'reviewChargeElements.reviewChargeReferenceId'
        )
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements.reviewChargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements.reviewChargeElements', (builder) => {
      builder
        .select(['reviewChargeElements.id', 'reviewChargeElements.amendedAllocated'])
        .innerJoin(
          'reviewChargeReferences',
          'reviewChargeReferences.id',
          'reviewChargeElements.reviewChargeReferenceId'
        )
        .innerJoin('reviewChargeVersions', 'reviewChargeVersions.id', 'reviewChargeReferences.reviewChargeVersionId')
        .innerJoin('reviewLicences', 'reviewLicences.id', 'reviewChargeVersions.reviewLicenceId')
        .where('reviewLicences.billRunId', billRunId)
    })
}

function _whereBillingAccountExistsClause(billRunId) {
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
