'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page
 * @module ReviewLicenceService
 */

const FetchReviewLicenceResultsService = require('./fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/review-licence.presenter.js')
const PrepareReviewLicenceResultsService = require('./prepare-review-licence-results.service.js')

/**
 * Orchestrated fetching and presenting the data needed for the licence review page
 *
 * @param {*} billRunId The UUID for the bill run
 * @param {*} licenceId The UUID of the licence that is being reviewed
 * @param {*} status The current overall status of the licence
 *
 * @returns {Object} an object representing the 'pageData' needed to review the individual licence. It contains the
 * licence matched and unmatched returns and the licence charge data
 */
async function go (billRunId, licenceId) {
  const { reviewReturns, billRun, licenceRef } = await FetchReviewLicenceResultsService.go(billRunId, licenceId)

  const { matchedReturns, unmatchedReturns, chargePeriods } = PrepareReviewLicenceResultsService.go(reviewReturns)

  const pageData = ReviewLicencePresenter.go(matchedReturns, unmatchedReturns, chargePeriods, billRun, licenceRef)

  return pageData
}

module.exports = {
  go
}
