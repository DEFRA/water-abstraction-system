'use strict'

/**
 * Determines the issues on the licence for a two-part tariff bill run
 * @module FetchReviewResultService
 */

const ReviewResultModel = require('../../../models/review-result.model.js')

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
