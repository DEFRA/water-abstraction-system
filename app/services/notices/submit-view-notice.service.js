'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitViewNoticeService
 */

const FetchNoticeService = require('../../services/notices/fetch-notice.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewNoticePresenter = require('../../presenters/notices/view-notice.presenter.js')
const ViewValidator = require('../../validators/notices/view.validator.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {string} noticeId - The UUID of the selected notice
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the view page
 * else the data needed to re-render the page
 */
async function go(noticeId, payload, yar, page = 1) {
  const filterKey = `noticeFilter-${noticeId}`
  const clearFilters = _clearFilters(payload, yar, filterKey)

  if (clearFilters) {
    return {}
  }

  const error = _validate(payload)

  if (!error) {
    _save(payload, yar, filterKey)

    return {}
  }

  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number
  const selectedPageNumber = Number(page)

  const savedFilters = _savedFilters(yar, filterKey)

  return _replayView(noticeId, payload, error, selectedPageNumber, savedFilters)
}

function _clearFilters(payload, yar, filterKey) {
  const clearFilters = payload.clearFilters

  if (clearFilters) {
    yar.clear(filterKey)

    return true
  }

  return false
}

async function _replayView(noticeId, payload, error, selectedPageNumber, savedFilters) {
  const { notice, notifications, totalNumber } = await FetchNoticeService.go(noticeId, selectedPageNumber, savedFilters)

  const pagination = PaginatorPresenter.go(totalNumber, selectedPageNumber, `/system/notices/${notice.id}`)
  const pageData = ViewNoticePresenter.go(
    notice,
    notifications,
    totalNumber,
    selectedPageNumber,
    pagination.numberOfPages
  )

  return {
    activeNavBar: 'manage',
    error,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination,
    totalNumber
  }
}

function _save(payload, yar, filterKey) {
  yar.set(filterKey, {
    licence: payload.licence ?? null,
    recipient: payload.recipient ?? null,
    status: payload.status ?? null
  })
}

function _savedFilters(yar, filterKey) {
  return {
    licence: null,
    openFilter: true,
    recipient: null,
    status: null,
    ...yar.get(filterKey)
  }
}

function _validate(payload) {
  const validationResult = ViewValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
