'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence review page
 * @module LicenceReviewBillRunService
 */

const FetchLicenceReviewDataService = require('./fetch-licence-review-data.service.js')
const LicenceReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/licence-review-bill-run.presenter.js')
const PrepareLicenceReturnsService = require('./prepare-licence-returns.service.js')

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
async function go (billRunId, licenceId, status) {
  const { returnLogs, licence, billRun } = await FetchLicenceReviewDataService.go(billRunId, licenceId)

  const { matchedReturns, unmatchedReturns, chargePeriods } = await PrepareLicenceReturnsService.go(returnLogs)

  const pageData = await LicenceReviewBillRunPresenter.go(matchedReturns, unmatchedReturns, chargePeriods, licence, billRun, status)

  return pageData
}

module.exports = {
  go
}
