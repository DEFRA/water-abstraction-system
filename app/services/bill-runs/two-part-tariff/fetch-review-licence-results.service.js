'use strict'

/**
 * Fetches the review licence results and bill run data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches the review return results data for an individual licence in the bill run and the bill run data
 *
 * @param {String} billRunId UUID of the bill run
 * @param {String} licenceId UUID of the licence
 *
 * @returns {Promise<Object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const reviewReturnResults = await _fetchReviewReturnResults(billRunId, licenceId)
  const licenceRef = await _licenceRef(licenceId)

  return { reviewReturnResults, billRun, licenceRef }
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

async function _licenceRef (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')
}

async function _fetchReviewReturnResults (billRunId, licenceId) {
  return ReviewResultModel.query()
    .where({ billRunId, licenceId })
    .whereNotNull('reviewReturnResultId')
    .select([
      'reviewReturnResultId',
      'reviewChargeElementResultId',
      'chargeVersionId',
      'chargePeriodStartDate',
      'chargePeriodEndDate'])
    .withGraphFetched('reviewReturnResults')
    .modifyGraph('reviewReturnResults', (builder) => {
      builder.select([
        'id',
        'returnId',
        'return_reference',
        'startDate',
        'endDate',
        'dueDate',
        'receivedDate',
        'status',
        'underQuery',
        'nilReturn',
        'description',
        'purposes',
        'quantity',
        'allocated',
        'abstractionOutsidePeriod'
      ])
    })
}

module.exports = {
  go
}
