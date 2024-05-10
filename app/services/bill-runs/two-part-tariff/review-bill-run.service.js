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
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} An object representing the `pageData` needed by the review bill run template. It contains
 * details of the bill run and the licences linked to it as well as any data that has been used to filter the results.
 */
async function go (id, yar) {
  const filters = yar.get('filters')

  const filterIssues = filters?.filterIssues
  const filterLicenceHolder = filters?.filterLicenceHolder
  const filterLicenceStatus = filters?.filterLicenceStatus

  const { billRun, licences } = await FetchBillRunLicencesService.go(
    id,
    filterIssues,
    filterLicenceHolder,
    filterLicenceStatus
  )

  const [bannerMessage] = yar.flash('banner')
  const pageData = ReviewBillRunPresenter.go(billRun, filterIssues, filterLicenceHolder, filterLicenceStatus, licences)

  return {
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
