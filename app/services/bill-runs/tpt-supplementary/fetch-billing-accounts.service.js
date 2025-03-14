'use strict'

/**
 * Fetches all billing accounts linked to a bill run to be processed as part of supplementary two-part tariff billing
 * @module FetchBillingAccountsService
 */

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

/**
 * Fetches all billing accounts linked to a bill run to be processed as part of supplementary two-part tariff billing
 *
 * Unlike regular annual and supplementary, when we come to generate the bill run the licences that will be in it have
 * already been determined. This is because they were first flagged for two-part tariff via creation of a licence
 * supplementary year record. Then, when the bill run was created its ID will have been assigned to the record.
 *
 * So, at this point in the process we are only interested in billing accounts linked to licences with a licence
 * supplementary year record that have been assigned to this bill run we're fetching billing accounts for.
 *
 * Generally, those licences will have also gone through the match & allocate step, so their charge versions and charge
 * references will have corresponding entries in the `review_charge_[]` tables.
 *
 * But there is an additional complexity. As part of two-part tariff supplementary we also have to process licences that
 * were included in the two-part tariff annual, for example, but then have had their two-part tariff agreement removed
 * (hence they got flagged).
 *
 * We have to include them in the bill run, so we can generate a credit transaction based on the previous debit. But
 * they won't have gone through match & allocate, so won't have `review_charge_[]` records, because the new charge
 * version isn't two-part tariff (match and allocate only works with TPT charge versions).
 *
 * For those processed by match & allocate we can combine the source charge information with the result of review in
 * order to generate the transactions. For the rest, we just look at their previous transactions for possible credits.
 *
 * All that is done in `ProcessBillingPeriodService` though. This just focuses on fetching the data!
 *
 * @param {string} billRunId - The UUID of the supplementary two-part tariff bill run to fetch billing accounts for
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<module:BillingAccountModel[]>} An array of `BillingAccountModel` to be billed and their relevant
 * licence, charge version, charge element etc records, plus the two-part tariff review details needed to generate the
 * bill run
 */
async function go(billRunId, billingPeriod) {
  return BillingAccountModel.query()
    .select(['billingAccounts.id', 'billingAccounts.accountNumber'])
    .whereExists(_whereExistsClause(billRunId, billingPeriod))
    .orderBy([{ column: 'billingAccounts.accountNumber' }])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder.select([
        'chargeVersions.id',
        'chargeVersions.scheme',
        'chargeVersions.startDate',
        'chargeVersions.endDate',
        'chargeVersions.billingAccountId',
        'chargeVersions.status'
      ])

      _whereClauseForChargeVersions(builder, billRunId, billingPeriod)

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

function _whereClauseForChargeVersions(query, billRunId, billingPeriod) {
  return query
    .innerJoin('licenceSupplementaryYears', 'licenceSupplementaryYears.licenceId', 'chargeVersions.licenceId')
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where((builder) => {
      builder.whereNull('chargeVersions.endDate').orWhere('chargeVersions.endDate', '>=', billingPeriod.startDate)
    })
    .where('licenceSupplementaryYears.billRunId', billRunId)
}

function _whereExistsClause(billRunId, billingPeriod) {
  let query = ChargeVersionModel.query().select(1)

  query = _whereClauseForChargeVersions(query, billRunId, billingPeriod)
  query.whereColumn('chargeVersions.billingAccountId', 'billingAccounts.id')

  return query
}

module.exports = {
  go
}
