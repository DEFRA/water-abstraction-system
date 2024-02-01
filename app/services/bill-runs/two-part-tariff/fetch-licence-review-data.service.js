'use strict'

/**
 * @module FetchLicenceReviewDataService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const licence = await _fetchLicence(licenceId)
  const returnLogs = await _fetchReturnLogs(billRunId, licenceId)
  await _fetchReviewReturns(returnLogs)

  return { returnLogs, licence, billRun }
}

async function _fetchReviewReturns (returnLogs) {
  for (const returnLog of returnLogs) {
    const reviewReturnResult = await _fetchReturns(returnLog.reviewReturnResultId)

    returnLog.reviewReturnResult = reviewReturnResult
  }
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

async function _fetchLicence (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')
}

async function _fetchReturnLogs (billRunId, licenceId) {
  return ReviewResultModel.query()
    .where({ billRunId, licenceId })
    .whereNotNull('reviewReturnResultId')
    .distinct('reviewReturnResultId')
    .select([
      'reviewReturnResultId',
      'reviewChargeElementResultId',
      'chargeVersionId',
      'chargePeriodStartDate',
      'chargePeriodEndDate'])
}

async function _fetchReturns (id) {
  return ReviewReturnResultModel.query()
    .findById(id)
}

module.exports = {
  go
}
