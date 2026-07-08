/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexBillRunsService
 */

import { formatValidationResult } from '../../presenters/base.presenter.js'
import CheckBusyBillRunsService from './check-busy-bill-runs.service.js'
import FetchBillRunsService from './fetch-bill-runs.service.js'
import FetchRegionsService from './setup/fetch-regions.service.js'
import IndexBillRunsPresenter from '../../presenters/bill-runs/index-bill-runs.presenter.js'
import IndexValidator from '../../validators/bill-runs/index.validator.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { clearFilters, handleOneOptionSelected } from '../../lib/submit-page.lib.js'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the index page
 * else the data needed to re-render the page
 */
export default async function go(payload, yar, page) {
  const filterCleared = clearFilters(payload, yar, 'billRunsFilter')

  if (filterCleared) {
    return {}
  }

  handleOneOptionSelected(payload, 'regions')
  handleOneOptionSelected(payload, 'runTypes')
  handleOneOptionSelected(payload, 'statuses')

  const regions = await FetchRegionsService()
  const error = _validate(payload, regions)

  if (!error) {
    _save(payload, yar)

    return {}
  }

  const savedFilters = _savedFilters(yar)

  return _replayView(payload, error, page, regions, savedFilters)
}

async function _replayView(payload, error, page, regions, savedFilters) {
  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number

  // We expect the FetchBillRunsService to take the longest to complete. But running them together means we are only
  // waiting as long as it takes FetchBillRunsService to complete rather than their combined time
  const [busyResult, { results: billRuns, total: totalNumber }] = await Promise.all([
    CheckBusyBillRunsService(),
    FetchBillRunsService(savedFilters, page)
  ])

  const pagination = PaginatorPresenter.go(totalNumber, page, '/system/bill-runs', billRuns.length, 'bill runs')

  const filters = { ...savedFilters, ...payload }

  const pageData = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

  return {
    activeNavBar: 'bill-runs',
    error,
    filters,
    ...pageData,
    pagination
  }
}

function _save(payload, yar) {
  yar.set('billRunsFilter', {
    number: payload.number ?? null,
    regions: payload.regions,
    runTypes: payload.runTypes,
    statuses: payload.statuses,
    yearCreated: payload.yearCreated ?? null
  })
}

function _savedFilters(yar) {
  return {
    number: null,
    openFilter: true,
    regions: [],
    runTypes: [],
    statuses: [],
    yearCreated: null,
    ...yar.get('billRunsFilter')
  }
}

function _validate(payload, regions) {
  const validationResult = IndexValidator.go(payload, regions)

  return formatValidationResult(validationResult)
}
