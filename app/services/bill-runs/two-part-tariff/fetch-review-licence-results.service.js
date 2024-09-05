'use strict'

/**
 * Fetches the individual review licence data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const { ref } = require('objection')

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchBillingAccountService = require('../../fetch-billing-account.service.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Fetches the bill run and an individual licences review data for a two-part tariff bill run
 *
 * @param {module:BillRunModel} billRunId - UUID of the bill run
 * @param {module:LicenceModel} licenceId - UUID of the individual licence to review
 *
 * @returns {Promise<object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const licence = await _fetchReviewLicence(licenceId, billRunId)

  await _fetchBillingAccountDetails(licence[0].reviewChargeVersions)

  return { billRun, licence }
}

async function _fetchBillingAccountDetails (reviewChargeVersions) {
  for (const reviewChargeVersion of reviewChargeVersions) {
    reviewChargeVersion.billingAccountDetails = await FetchBillingAccountService.go(
      reviewChargeVersion.chargeVersion.billingAccountId
    )
  }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'id',
      'fromFinancialYearEnding',
      'toFinancialYearEnding')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select('displayName')
    })
}

async function _fetchReviewLicence (licenceId, billRunId) {
  return ReviewLicenceModel.query()
    .select(
      'id',
      'billRunId',
      'licenceId',
      'licenceRef',
      'licenceHolder',
      'issues',
      'status',
      'progress',
      ReviewLicenceModel.raw(`
      EXISTS (SELECT 1
        FROM review_charge_elements rce
        INNER JOIN review_charge_references rcr ON rce.review_charge_reference_id = rcr.id
        INNER JOIN review_charge_versions rcv ON rcr.review_charge_version_id = rcv.id
        WHERE rce.status = 'review'
        AND rcv.review_licence_id = review_licences.id) AS has_review_status
        `)
    )
    .where('licenceId', licenceId)
    .where('billRunId', billRunId)
    .withGraphFetched('reviewReturns.reviewChargeElements')
    .modifyGraph('reviewReturns', (builder) => {
      builder.orderBy('reviewReturns.startDate', 'asc')
    })
    .withGraphFetched('reviewReturns.returnLog')
    .modifyGraph('reviewReturns.returnLog', (builder) => {
      builder.select([
        ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
        ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
        ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
        ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth')])
    })
    .withGraphFetched('reviewChargeVersions')
    .modifyGraph('reviewChargeVersions', (builder) => {
      builder
        .join('chargeVersions', 'reviewChargeVersions.chargeVersionId', 'chargeVersions.id')
        .orderBy('chargeVersions.startDate', 'asc')
    })
    .withGraphFetched('reviewChargeVersions.chargeVersion')
    .modifyGraph('reviewChargeVersions.chargeVersion', (builder) => {
      builder.select([
        'billingAccountId'
      ])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences', (builder) => {
      builder
        .join('chargeReferences', 'reviewChargeReferences.chargeReferenceId', 'chargeReferences.id')
        .join('chargeCategories', 'chargeReferences.chargeCategoryId', 'chargeCategories.id')
        .orderBy('chargeCategories.subsistenceCharge', 'desc')
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.chargeReference')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences.chargeReference', (builder) => {
      builder.select([
        'chargeCategoryId'
      ])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.chargeReference.chargeCategory')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences.chargeReference.chargeCategory', (builder) => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences.reviewChargeElements', (builder) => {
      builder
        .join('chargeElements', 'reviewChargeElements.chargeElementId', 'chargeElements.id')
        .orderBy('chargeElements.authorisedAnnualQuantity', 'desc')
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.chargeElement')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.chargeElement', (builder) => {
      builder.select([
        'description',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.chargeElement.purpose')
    .modifyGraph('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.chargeElement.purpose', (builder) => {
      builder.select(['description'])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')
}

module.exports = {
  go
}
