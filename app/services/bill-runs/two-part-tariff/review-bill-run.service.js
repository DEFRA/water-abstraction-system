'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 * @module ReviewBillRunService
 */

const FetchBillRunLicencesService = require('./fetch-bill-run-licences.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
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
async function go (id, page, yar) {
  const filters = yar.get('reviewFilters')

  const filterIssues = filters?.filterIssues
  const filterLicenceHolder = filters?.filterLicenceHolder
  const filterLicenceStatus = filters?.filterLicenceStatus

  const selectedPageNumber = _selectedPageNumber(page)

  const { billRun, licences } = await FetchBillRunLicencesService.go(
    id,
    filterIssues,
    filterLicenceHolder,
    filterLicenceStatus,
    selectedPageNumber
  )

  const [bannerMessage] = yar.flash('banner')
  const pageData = ReviewBillRunPresenter.go(
    billRun,
    filterIssues,
    filterLicenceHolder,
    filterLicenceStatus,
    licences.results
  )

  const pagination = PaginatorPresenter.go(
    licences.total,
    selectedPageNumber,
    `/system/bill-runs/${id}/review`
  )

  const pageTitle = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  return {
    bannerMessage,
    ...pageData,
    pageTitle,
    pagination
  }
}

function _pageTitle (numberOfPages, selectedPageNumber) {
  if (numberOfPages === 1) {
    return 'Review licences'
  }

  return `Review licences (page ${selectedPageNumber} of ${numberOfPages})`
}

function _selectedPageNumber (page) {
  if (!page) {
    return 1
  }

  return Number(page)
}

module.exports = {
  go
}
