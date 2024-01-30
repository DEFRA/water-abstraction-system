'use strict'

/**
 * Fetches the review results data for a given licence along with their associated charge elements and return logs
 * @module FetchReviewResultService
 */

const ReviewResultModel = require('../../../models/review-result.model.js')

/**
 * Fetches the review results data for a given licence along with their associated charge elements and return logs
 *
 * @param {String} licenceId the id of the licence
 *
 * @returns {module:ReviewResultModel} the review result data associated with the given licence
 */
async function go (licenceId) {
  const reviewResults = await _fetchReviewResults(licenceId)

  return reviewResults
}

async function _fetchReviewResults (licenceId) {
  return ReviewResultModel.query()
    .where('licenceId', licenceId)
    .select(
      'reviewChargeElementResultId',
      'chargeReferenceId',
      'reviewReturnResultId'
    )
    .withGraphFetched('reviewChargeElementResults')
    .modifyGraph('reviewChargeElementResults', (builder) => {
      builder.select([
        'id',
        'chargeDatesOverlap',
        'aggregate'
      ])
    })
    .withGraphFetched('reviewReturnResults')
    .modifyGraph('reviewReturnResults', (builder) => {
      builder.select([
        'id',
        'underQuery',
        'quantity',
        'allocated',
        'abstractionOutsidePeriod',
        'status',
        'dueDate',
        'receivedDate'
      ])
    })
}

module.exports = {
  go
}
