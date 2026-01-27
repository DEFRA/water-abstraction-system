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
 * @returns {Promise<object>} The view data for the bill runs page
 */
async function go(page = 1) {
  const selectedPageNumber = Number(page)

  // We expect the FetchBillRunsService to take longer to complete than CheckBusyBillRunsService. But running them
  // together means we are only waiting as long as it takes FetchBillRunsService to complete rather than their combined
  // time
  const [{ results: billRuns, total: totalNumber }, busyResult] = await Promise.all([
    FetchBillRunsService.go(selectedPageNumber),
    CheckBusyBillRunsService.go()
  ])

  const pagination = PaginatorPresenter.go(
    totalNumber,
    selectedPageNumber,
    '/system/bill-runs',
    billRuns.length,
    'bill runs'
  )

  const pageData = IndexBillRunsPresenter.go(billRuns, busyResult)

  return {
    activeNavBar: 'bill-runs',
    ...pageData,
    pagination
  }
}

module.exports = {
  go
}
