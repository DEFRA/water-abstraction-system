'use strict'

/**
 * @module FetchLicenceReviewReturnsService
 */

const LicenceModel = require('../../../models/licence.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (billRunId, licenceId) {
  const licence = await _fetchLicenceRef(licenceId)

  const returnLogs = await _fetchLicenceReturns(billRunId, licenceId)

  for (const returnLog of returnLogs) {
    const reviewReturnResult = await _fetchReturns(returnLog.reviewReturnResultId)

    returnLog.reviewReturnResult = reviewReturnResult
  }

  return { returnLogs, licence }
}

async function _fetchLicenceRef (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')
}

async function _fetchLicenceReturns (billRunId, licenceId) {
  return ReviewResultModel.query()
    .where({ billRunId, licenceId })
    .distinct('reviewReturnResultId')
}

async function _fetchReturns (id) {
  return ReviewReturnResultModel.query()
    .findById(id)
}

module.exports = {
  go
}
