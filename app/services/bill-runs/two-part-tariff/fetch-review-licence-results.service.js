'use strict'

/**
 * Fetches the bill run data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Fetches the review returns data for an individual licence in the bill run and the bill run data
 *
 * @param {String} billRunId UUID of the bill run
 *
 * @returns {Promise<Object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const licence = await _fetchReviewLicence(licenceId, billRunId)

  return { billRun, licence }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select([
      'id',
      'batchType'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
}
async function _fetchReviewLicence (licenceId, billRunId) {
  return await ReviewLicenceModel.query()
    .where('licenceId', licenceId)
    .where('billRunId', billRunId)
    .withGraphFetched('reviewReturns.reviewChargeElements')
    .withGraphFetched('reviewChargeVersions')
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
    .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')
}

module.exports = {
  go
}
