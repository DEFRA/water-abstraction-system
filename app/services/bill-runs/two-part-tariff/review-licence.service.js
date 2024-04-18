'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page in a two-part tariff bill run
 * @module ReviewLicenceService
 */

const FetchReviewLicenceResultsService = require('./fetch-review-licence-results.service.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

/**
 * Orchestrated fetching and presenting the data needed for the licence review page
 *
 * @param {module:BillRunModel} billRunId The UUID for the bill run
 * @param {module:LicenceModel} licenceId The UUID of the licence that is being reviewed
 * @param {Object} payload The `request.payload` containing the `marKProgress` data. This is only passed to the service
 * when there is a POST request, which only occurs when the 'Mark progress' button is clicked.
 *
 * @returns {Object} an object representing the 'pageData' needed to review the individual licence. It contains the
 * licence, bill run, matched and unmatched returns and the licence charge data
 */
async function go (billRunId, licenceId, payload) {
  const licenceStatus = payload?.licenceStatus
  const markProgress = payload?.marKProgress

  if (licenceStatus === 'ready' || licenceStatus === 'review') {
    await _updateStatus(billRunId, licenceId, licenceStatus)
  }

  if (markProgress === 'mark' || markProgress === 'unmark') {
    await _updateProgress(billRunId, licenceId, markProgress)
  }

  const { billRun, licence } = await FetchReviewLicenceResultsService.go(billRunId, licenceId)

  const pageData = ReviewLicencePresenter.go(billRun, licence, licenceStatus, markProgress)

  return pageData
}

async function _updateProgress (billRunId, licenceId, marKProgress) {
  const progress = marKProgress === 'mark'

  await ReviewLicenceModel.query()
    .patch({ progress })
    .where('billRunId', billRunId)
    .andWhere('licenceId', licenceId)
}

async function _updateStatus (billRunId, licenceId, licenceStatus) {
  await ReviewLicenceModel.query()
    .patch({ status: licenceStatus })
    .where('billRunId', billRunId)
    .andWhere('licenceId', licenceId)
}

module.exports = {
  go
}
