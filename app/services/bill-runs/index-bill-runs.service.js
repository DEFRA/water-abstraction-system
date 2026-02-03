'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 * @module IndexBillRunsService
 */

const CheckBusyBillRunsService = require('./check-busy-bill-runs.service.js')
const FetchBillRunsService = require('./fetch-bill-runs.service.js')
const FetchRegionsService = require('./setup/fetch-regions.service.js')
const IndexBillRunsPresenter = require('../../presenters/bill-runs/index-bill-runs.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the bill runs page
 */
async function go(yar, page = 1) {
  const filters = _filters(yar)

  const selectedPageNumber = Number(page)

  // We expect the FetchBillRunsService to take the longest to complete. But running them together means we are only
  // waiting as long as it takes FetchBillRunsService to complete rather than their combined time
  const [busyResult, { results: billRuns, total: totalNumber }, regions] = await Promise.all([
    CheckBusyBillRunsService.go(),
    FetchBillRunsService.go(filters, selectedPageNumber),
    FetchRegionsService.go()
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
    filters,
    ...pageData,
    pagination,
    regions
  }
}

function _filters(yar) {
  let openFilter = false

  const savedFilters = yar.get('billRunsFilter')

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      openFilter = !!savedFilters[key]

      if (openFilter) {
        break
      }
    }
  }

  return {
    regions: [],
    yearCreated: null,
    ...savedFilters,
    openFilter
  }
}

module.exports = {
  go
}
