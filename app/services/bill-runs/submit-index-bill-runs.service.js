'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexBillRunsService
 */

const { formatValidationResult } = require('../../presenters/base.presenter.js')
const CheckBusyBillRunsService = require('./check-busy-bill-runs.service.js')
const FetchBillRunsService = require('./fetch-bill-runs.service.js')
const FetchRegionsService = require('./setup/fetch-regions.service.js')
const IndexBillRunsPresenter = require('../../presenters/bill-runs/index-bill-runs.presenter.js')
const IndexValidator = require('../../validators/bill-runs/index.validator.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the index page
 * else the data needed to re-render the page
 */
async function go(payload, yar, page = 1) {
  const clearFilters = _clearFilters(payload, yar)

  if (clearFilters) {
    return {}
  }

  _handleOneOptionSelected(payload, 'regions')
  _handleOneOptionSelected(payload, 'runTypes')
  _handleOneOptionSelected(payload, 'statuses')

  const regions = await FetchRegionsService.go()
  const error = _validate(payload, regions)

  if (!error) {
    _save(payload, yar)

    return {}
  }

  const savedFilters = _savedFilters(yar)

  return _replayView(payload, error, page, regions, savedFilters)
}

function _clearFilters(payload, yar) {
  const clearFilters = payload.clearFilters

  if (clearFilters) {
    yar.clear('billRunsFilter')

    return true
  }

  return false
}

/**
 * When a single type is checked by the user, it returns as a string. When multiple types are checked, the 'types' is
 * returned as an array. When nothing is checked then the property doesn't exist in the payload.
 *
 * This function works to handle these discrepancies.
 *
 * @private
 */
function _handleOneOptionSelected(payload, key) {
  if (!payload?.[key]) {
    payload[key] = []

    return
  }

  if (!Array.isArray(payload?.[key])) {
    payload[key] = [payload?.[key]]
  }
}

async function _replayView(payload, error, page, regions, savedFilters) {
  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number
  const selectedPageNumber = Number(page)

  // We expect the FetchBillRunsService to take the longest to complete. But running them together means we are only
  // waiting as long as it takes FetchBillRunsService to complete rather than their combined time
  const [busyResult, { results: billRuns, total: totalNumber }] = await Promise.all([
    CheckBusyBillRunsService.go(),
    FetchBillRunsService.go(savedFilters, selectedPageNumber)
  ])

  const pagination = PaginatorPresenter.go(
    totalNumber,
    selectedPageNumber,
    '/system/bill-runs',
    billRuns.length,
    'bill runs'
  )

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

function _savedFilters(payload) {
  const { clear, get, set, ...billRunsFilter } = payload

  return {
    number: null,
    openFilter: true,
    regions: [],
    runTypes: [],
    statuses: [],
    yearCreated: null,
    ...billRunsFilter
  }
}

function _validate(payload, regions) {
  const validationResult = IndexValidator.go(payload, regions)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
