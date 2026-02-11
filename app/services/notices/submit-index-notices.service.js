'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexNoticesService
 */

const FetchNoticesService = require('./fetch-notices.service.js')
const IndexValidator = require('../../validators/notices/index.validator.js')
const NoticesIndexPresenter = require('../../presenters/notices/index-notices.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')
const { handleOneOptionSelected } = require('../../lib/submit-page.lib.js')

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the index page
 * else the data needed to re-render the page
 */
async function go(payload, yar, auth, page = 1) {
  const clearFilters = _clearFilters(payload, yar)

  if (clearFilters) {
    return {}
  }

  handleOneOptionSelected(payload, 'noticeTypes')
  handleOneOptionSelected(payload, 'statuses')

  const error = _validate(payload)

  if (!error) {
    _save(payload, yar)

    return {}
  }

  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number
  const selectedPageNumber = Number(page)

  const savedFilters = _savedFilters(yar)

  return _replayView(payload, error, selectedPageNumber, savedFilters, auth)
}

function _clearFilters(payload, yar) {
  const clearFilters = payload.clearFilters

  if (clearFilters) {
    yar.clear('noticesFilter')

    return true
  }

  return false
}

async function _replayView(payload, error, selectedPageNumber, savedFilters, auth) {
  const { results: notices, total: totalNumber } = await FetchNoticesService.go(savedFilters, selectedPageNumber)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    selectedPageNumber,
    `/system/notices`,
    notices.length,
    'notices'
  )

  const pageData = NoticesIndexPresenter.go(notices, auth)

  return {
    activeNavBar: 'notices',
    error,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination
  }
}

function _save(payload, yar) {
  yar.set('noticesFilter', {
    noticeTypes: payload.noticeTypes,
    fromDate: payload.fromDate,
    reference: payload.reference ?? null,
    sentBy: payload.sentBy ?? null,
    sentFromDay: payload.sentFromDay ?? null,
    sentFromMonth: payload.sentFromMonth ?? null,
    sentFromYear: payload.sentFromYear ?? null,
    sentToDay: payload.sentToDay ?? null,
    sentToMonth: payload.sentToMonth ?? null,
    sentToYear: payload.sentToYear ?? null,
    statuses: payload.statuses,
    toDate: payload.toDate
  })
}

function _savedFilters(payload) {
  const { clear, get, set, ...noticesFilter } = payload

  return {
    sentFromDay: null,
    sentFromMonth: null,
    sentFromYear: null,
    sentToDay: null,
    sentToMonth: null,
    sentToYear: null,
    noticeTypes: [],
    openFilter: true,
    reference: null,
    sentBy: null,
    statuses: [],
    ...noticesFilter
  }
}

function _validate(payload) {
  const validationResult = IndexValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
