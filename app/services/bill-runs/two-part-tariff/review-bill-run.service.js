'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 * @module ReviewBillRunService
 */

const FetchBillRunLicencesService = require('./fetch-bill-run-licences.service.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 *
 * @param {String} id The UUID for the bill run to review
 * @param {Object} payload The `request.payload` containing the filter data. This is only passed to the service when
 * there is a POST request, which only occurs when a filter is applied to the results.
 *
 * @returns {Promise<Object>} An object representing the `pageData` needed by the review bill run template. It contains
 * details of the bill run and the licences linked to it as well as any data that has been used to filter the results.
 */
async function go (id, payload = null) {
  const { billRun, licences, filterData } = await FetchBillRunLicencesService.go(id, payload)

  const pageData = ReviewBillRunPresenter.go(billRun, licences, filterData)

  return pageData
}

module.exports = {
  go
}
