'use strict'

/**
 * Fetches the individual charge reference details during the review stage of a two-part tariff bill run
 * @module FetchReviewChargeReferenceService
 */

const { ref } = require('objection')

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Fetches the charge reference details for an individual licence
 *
 * @param {string} billRunId - UUID of the bill run
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being viewed
 *
 * @returns {Promise<object>} An object containing the bill run and review charge reference instances
 */
async function go (billRunId, reviewChargeReferenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const reviewChargeReference = await _fetchReviewChargeReference(reviewChargeReferenceId)

  return { billRun, reviewChargeReference }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'id',
      'toFinancialYearEnding')
}

async function _fetchReviewChargeReference (reviewChargeReferenceId) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .withGraphFetched('chargeReference')
    .modifyGraph('chargeReference', (builder) => {
      builder.select([
        'volume',
        'chargeCategoryId',
        ref('chargeReferences.additionalCharges:supportedSource.name').castText().as('supportedSourceName'),
        ref('chargeReferences.additionalCharges:isSupplyPublicWater').castText().as('waterCompanyCharge')
      ])
    })
    .withGraphFetched('chargeReference.chargeCategory')
    .modifyGraph('chargeReference.chargeCategory', (builder) => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('reviewChargeVersion')
    .modifyGraph('reviewChargeVersion', (builder) => {
      builder.select([
        'chargePeriodStartDate',
        'chargePeriodEndDate'
      ])
    })
    .withGraphFetched('reviewChargeElements')
    .modifyGraph('reviewChargeElements', (builder) => {
      builder.select([
        'amendedAllocated'
      ])
    })
}

module.exports = {
  go
}
