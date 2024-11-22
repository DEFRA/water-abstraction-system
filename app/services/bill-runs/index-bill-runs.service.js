'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 * @module IndexBillRunsService
 */

const CheckBusyBillRunsService = require('./check-busy-bill-runs.service.js')
const FetchBillRunsService = require('./fetch-bill-runs.service.js')
const IndexBillRunsPresenter = require('../../presenters/bill-runs/index-bill-runs.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 *
 * @param {string} page - the page number of bill runs to be viewed
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the index bill run template. It contains
 * summary details for each bill run for the page selected, the template's pagination control, the title and the
 * status of any busy bill runs
 */
async function go(page) {
  const selectedPageNumber = _selectedPageNumber(page)

  // We expect the FetchBillRunsService to take longer to complete than CheckBusyBillRunsService. But running them
  // together means we are only waiting as long as it takes FetchBillRunsService to complete rather than their combined
  // time
  const [fetchedBillRunResult, busyResult] = await Promise.all([
    FetchBillRunsService.go(selectedPageNumber),
    CheckBusyBillRunsService.go()
  ])

  const billRuns = IndexBillRunsPresenter.go(fetchedBillRunResult.results)
  const pagination = PaginatorPresenter.go(fetchedBillRunResult.total, selectedPageNumber, '/system/bill-runs')

  const pageTitle = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  return {
    billRuns,
    busy: busyResult,
    pageTitle,
    pagination
  }
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages === 1) {
    return 'Bill runs'
  }

  return `Bill runs (page ${selectedPageNumber} of ${numberOfPages})`
}

function _selectedPageNumber(page) {
  if (!page) {
    return 1
  }

  return Number(page)
}

module.exports = {
  go
}
