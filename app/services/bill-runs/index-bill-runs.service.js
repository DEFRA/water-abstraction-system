/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 * @module IndexBillRunsService
 */

import CheckBusyBillRunsService from './check-busy-bill-runs.service.js'
import FetchBillRunsService from './fetch-bill-runs.service.js'
import FetchRegionsService from './setup/fetch-regions.service.js'
import IndexBillRunsPresenter from '../../presenters/bill-runs/index-bill-runs.presenter.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { processSavedFilters } from '../../lib/submit-page.lib.js'

/**
 * Orchestrates fetching and presenting the data needed for the /bill-runs page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the bill runs page
 */
async function go(yar, page) {
  const filters = _filters(yar)

  // We expect the FetchBillRunsService to take the longest to complete. But running them together means we are only
  // waiting as long as it takes FetchBillRunsService to complete rather than their combined time
  const [busyResult, { results: billRuns, total: totalNumber }, regions] = await Promise.all([
    CheckBusyBillRunsService.go(),
    FetchBillRunsService.go(filters, page),
    FetchRegionsService.go()
  ])

  const pagination = PaginatorPresenter.go(totalNumber, page, '/system/bill-runs', billRuns.length, 'bill runs')

  const pageData = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

  return {
    activeNavBar: 'bill-runs',
    filters,
    ...pageData,
    pagination
  }
}

function _filters(yar) {
  const savedFilters = processSavedFilters(yar, 'billRunsFilter')

  return {
    number: null,
    regions: [],
    runTypes: [],
    statuses: [],
    yearCreated: null,
    ...savedFilters
  }
}

export { go }
export default {
  go
}
