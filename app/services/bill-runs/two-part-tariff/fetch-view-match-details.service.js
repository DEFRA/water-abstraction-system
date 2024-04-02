'use strict'

/**
 * Fetches the individual charge elements match details during the review stage of a two-part tariff bill run
 * @module FetchViewMatchDetailsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Fetches the match details for an individual charge element
 *
 * @param {module:BillRunModel} billRunId UUID of the bill run
 * @param {module:LicenceModel} licenceId UUID of the individual licence to review
 * @param {module:ReviewChargeElementModel} reviewChargeElementId The UUID of the review charge element being viewed
 *
 * @returns {Promise<Object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, reviewChargeElementId) {
  const billRun = await _fetchBillRun(billRunId)
  const reviewChargeElement = await _fetchReviewChargeElement(reviewChargeElementId)

  return { billRun, reviewChargeElement }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'id',
      'fromFinancialYearEnding',
      'toFinancialYearEnding')
}

async function _fetchReviewChargeElement (reviewChargeElementId) {
  const chargeElement = ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .withGraphFetched('reviewReturns')
    .withGraphFetched('chargeElement')
    .modifyGraph('chargeElement', (builder) => {
      builder.select([
        'description',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('reviewChargeReference')
    .modifyGraph('reviewChargeReference', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('reviewChargeReference.reviewChargeVersion')
    .modifyGraph('reviewChargeReference.reviewChargeVersion', (builder) => {
      builder.select([
        'chargePeriodStartDate',
        'chargePeriodEndDate'
      ])
    })

  return chargeElement
}

module.exports = {
  go
}
