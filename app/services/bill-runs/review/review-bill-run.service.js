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
 * @param {string} page - the page number of licences to be viewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object representing the `pageData` needed by the review bill run template. It contains
 * details of the bill run and the licences linked to it as well as any data that has been used to filter the results.
 */
async function go(id, page, yar) {
  const { filterIssues, filterLicenceHolderNumber, filterLicenceStatus, filterProgress } = _getFilters(id, yar)

  const selectedPageNumber = page ? Number(page) : 1

  const { billRun, licences } = await FetchBillRunLicencesService.go(
    id,
    filterIssues,
    filterLicenceHolderNumber,
    filterLicenceStatus,
    filterProgress,
    selectedPageNumber
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

  const pagination = PaginatorPresenter.go(licences.total, selectedPageNumber, `/system/bill-runs/review/${id}`)

  const pageTitle = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  return { activeNavBar: 'bill-runs', bannerMessage, ...pageData, pageTitle, pagination }
}

function _getFilters(id, yar) {
  const filters = yar.get(`review-${id}`)
  const filterIssues = filters?.filterIssues
  const filterLicenceHolderNumber = filters?.filterLicenceHolderNumber
  const filterLicenceStatus = filters?.filterLicenceStatus
  const filterProgress = filters?.filterProgress

  return { filterIssues, filterLicenceHolderNumber, filterLicenceStatus, filterProgress }
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Review licences'
  }

  return `Review licences (page ${selectedPageNumber} of ${numberOfPages})`
}

module.exports = {
  go
}
