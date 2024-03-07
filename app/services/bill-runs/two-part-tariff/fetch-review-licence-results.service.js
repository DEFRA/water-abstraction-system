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
  const licence = await _fetchLicenceRef(licenceId)

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

async function _fetchLicenceRef (licenceId) {
  return ReviewLicenceModel.query()
    .where('licenceId', licenceId)
    .select('licenceRef')
}

module.exports = {
  go
}
