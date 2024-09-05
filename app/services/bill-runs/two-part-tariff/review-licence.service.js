'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page in a two-part tariff bill run
 * @module ReviewLicenceService
 */

const FetchReviewLicenceResultsService = require('./fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence review page in a two-part tariff bill run
 *
 * @param {module:BillRunModel} billRunId - The UUID for the bill run
 * @param {module:LicenceModel} licenceId - The UUID of the licence that is being reviewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review licence page. It contains the licence, bill run,
 * matched and unmatched returns and the licence charge data
 */
async function go (billRunId, licenceId, yar) {
  const { billRun, licence } = await FetchReviewLicenceResultsService.go(billRunId, licenceId)

  const [bannerMessage] = yar.flash('banner')
  const pageData = ReviewLicencePresenter.go(billRun, licence)

  return {
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
