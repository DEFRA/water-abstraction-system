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
async function go(page = 1) {
  const selectedPageNumber = Number(page)

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
