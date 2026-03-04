'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 * @module ReviewBillRunService
 */

const FetchBillRunLicencesService = require('./fetch-bill-run-licences.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/review/review-bill-run.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 *
 * @param {string} id - The UUID for the bill run to review
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} An object representing the `pageData` needed by the review bill run template. It contains
 * details of the bill run and the licences linked to it as well as any data that has been used to filter the results.
 */
async function go(id, yar, page) {
  const { filterIssues, filterLicenceHolderNumber, filterLicenceStatus, filterProgress } = _getFilters(id, yar)

  const { billRun, licences } = await FetchBillRunLicencesService.go(
    id,
    filterIssues,
    filterLicenceHolderNumber,
    filterLicenceStatus,
    filterProgress,
    page
  )

  const [bannerMessage] = yar.flash('banner')

  const pageData = ReviewBillRunPresenter.go(
    billRun,
    filterIssues,
    filterLicenceHolderNumber,
    filterLicenceStatus,
    filterProgress,
    licences.results
  )

  const pagination = PaginatorPresenter.go(
    licences.total,
    page,
    `/system/bill-runs/review/${id}`,
    licences.results.length,
    'licences'
  )

  return { activeNavBar: 'bill-runs', bannerMessage, ...pageData, pageTitle: 'Review licences', pagination }
}

function _getFilters(id, yar) {
  const filters = yar.get(`review-${id}`)
  const filterIssues = filters?.filterIssues
  const filterLicenceHolderNumber = filters?.filterLicenceHolderNumber
  const filterLicenceStatus = filters?.filterLicenceStatus
  const filterProgress = filters?.filterProgress

  return { filterIssues, filterLicenceHolderNumber, filterLicenceStatus, filterProgress }
}

module.exports = {
  go
}
