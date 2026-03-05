'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review bill run page
 * @module ReviewBillRunService
 */

const FetchBillRunLicencesService = require('./fetch-bill-run-licences.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/review/review-bill-run.presenter.js')
const { readFlashNotification } = require('../../../lib/general.lib.js')
const { processSavedFilters } = require('../../../lib/submit-page.lib.js')

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
  const filterKey = `review-${id}`
  const filters = _filters(yar, filterKey)

  const { billRun, licences } = await FetchBillRunLicencesService.go(id, filters, page)

  const notification = readFlashNotification(yar)

  const pageData = ReviewBillRunPresenter.go(billRun, licences.results)

  const pagination = PaginatorPresenter.go(
    licences.total,
    page,
    `/system/bill-runs/review/${id}`,
    licences.results.length,
    'licences'
  )

  return {
    activeNavBar: 'bill-runs',
    filters,
    notification,
    ...pageData,
    pagination
  }
}

function _filters(yar, filterKey) {
  const savedFilters = processSavedFilters(yar, filterKey)

  return {
    issues: [],
    licenceHolderNumber: null,
    licenceStatus: null,
    progress: [],
    ...savedFilters
  }
}

module.exports = {
  go
}
