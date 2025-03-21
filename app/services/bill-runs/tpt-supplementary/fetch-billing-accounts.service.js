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
 * But there is additional complexity. As part of two-part tariff supplementary we also have to process licences that
 * were included in the two-part tariff annual, for example, but now it does not apply. This could be because they have
 * had their two-part tariff agreement removed: either a new charge version was added with TPT unticked or the licence
 * has been made non-chargeable (a special kind of charge version).
 *
 * We have to include them in the bill run, so we can generate credit transactions based on the previous debits. But
 * they won't have gone through match & allocate, so won't have `review_charge_[]` records, because the new charge
 * versions are't two-part tariff (match and allocate only works with TPT charge versions).
 *
 * This is why we do not filter charge versions by when they end, only by when they start. For example, licence 01/123
 * has a 2PT charge version that starts 2022-04-01 with no end date. It is therefore included in the 2023-24 2PT annual
 * bill run.
 *
 * The licence is then made non-chargeable by adding a new non-chargeable charge version starting on 2023-04-01. This
 * will flag the licence for 2PT supplementary.
 *
 * What users expect is that a credit will be raised that matches the 2023/24 2PT annual bill. Because we don't filter
 * by a charge versions end date, `FetchBillingAccountsService` will still return the 2PT charge version that starts on
 * 2022-04-01 and now ends 2023-03-31. `ProcessBillingPeriodService` will use the information to fetch previous 2PT
 * transactions in the 2023/24 period, which means it will find the previous debit and reverse it to create the credit!
 *
 * For those that were processed by match & allocate, `ProcessBillingPeriod` will combine the charge information with
 * the result of review in order to generate new transactions. For the rest, we just look at their previous transactions
 * for possible credits.
 *
 * @param {string} billRunId - The UUID of the supplementary two-part tariff bill run to fetch billing accounts for
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object[]>} An array of 'billing accounts to be billed and their relevant licence, charge version,
 * charge element etc records, plus the two-part tariff review details needed to generate the bill run
 */
async function go(billRunId, billingPeriod) {
  return _fetch(billRunId, billingPeriod)
}

async function _fetch(billRunId, billingPeriod) {
  return BillingAccountModel.query()
    .select(['billingAccounts.id', 'billingAccounts.accountNumber'])
    .whereExists(_whereExistsClause(billRunId, billingPeriod))
    .orderBy([{ column: 'billingAccounts.accountNumber' }])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder.distinct([
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
