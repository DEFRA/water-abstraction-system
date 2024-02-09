'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 * @module ReviewBillRunService
 */

const DetermineBillRunIssuesService = require('./determine-bill-run-issues.service.js')
const FetchBillRunLicencesService = require('./fetch-bill-run-licences.service.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 *
 * @param {string} id The UUID for the bill run to review
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the review bill run template. It contains details of
 * the bill run and the licences linked to it.
 */
async function go (id) {
  const { billRun, licences } = await FetchBillRunLicencesService.go(id)

  await DetermineBillRunIssuesService.go(licences)

  const pageData = ReviewBillRunPresenter.go(billRun, licences)

  return pageData
}

module.exports = {
  go
}
