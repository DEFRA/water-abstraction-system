'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page
 * @module ReviewLicenceService
 */

const FetchReviewLicenceResultsService = require('./fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

/**
 * Orchestrated fetching and presenting the data needed for the licence review page
 *
 * @param {*} billRunId The UUID for the bill run
 *
 * @returns {Object} an object representing the 'pageData' needed to review the individual licence. It contains the
 * licence matched and unmatched returns and the licence charge data
 */
async function go (billRunId, _licenceId) {
  const { billRun } = await FetchReviewLicenceResultsService.go(billRunId)

  const pageData = ReviewLicencePresenter.go(billRun)

  return pageData
}

module.exports = {
  go
}
