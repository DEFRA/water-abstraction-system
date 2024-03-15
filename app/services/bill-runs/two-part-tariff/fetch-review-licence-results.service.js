'use strict'

/**
 * Fetches the individual review licence data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchBillingAccountService = require('../../fetch-billing-account.service.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Fetches the bill run and an individual licences review data for a two-part tariff bill run
 *
 * @param {String} billRunId UUID of the bill run
 *
 * @returns {Promise<Object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const licence = await _fetchReviewLicence(licenceId, billRunId)
  await _fetchBillingAccountDetails(licence[0].reviewChargeVersions)

  return { billRun, licence }
}

async function _fetchBillingAccountDetails (reviewChargeVersions) {
  for (const reviewChargeVersion of reviewChargeVersions) {
    reviewChargeVersion.billingAccountDetails = await FetchBillingAccountService.go(reviewChargeVersion.chargeVersion.billingAccountId)
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
  return await ReviewLicenceModel.query()
    .where('licenceId', licenceId)
    .where('billRunId', billRunId)
    .withGraphFetched('reviewReturns.reviewChargeElements')
    .withGraphFetched('reviewChargeVersions')
    .withGraphFetched('reviewChargeVersions.chargeVersion')
    .modifyGraph('reviewChargeVersions.chargeVersion', (builder) => {
      builder.select([
        'billingAccountId'
      ])
    })
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
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
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')
}

module.exports = {
  go
}
