'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page in a two-part tariff bill run
 * @module ReviewLicenceService
 */

const FetchReviewLicenceResultsService = require('./fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

/**
 * Orchestrated fetching and presenting the data needed for the licence review page
 *
 * @param {module:BillRunModel} billRunId The UUID for the bill run
 * @param {module:LicenceModel} licenceId The UUID of the licence that is being reviewed
 *
 * @returns {Object} an object representing the 'pageData' needed to review the individual licence. It contains the
 * licence, bill run, matched and unmatched returns and the licence charge data
 */
async function go (billRunId, licenceId) {
  const { billRun, licence } = await FetchReviewLicenceResultsService.go(billRunId, licenceId)

  const pageData = ReviewLicencePresenter.go(billRun, licence)

  return pageData
}

module.exports = {
  go
}
