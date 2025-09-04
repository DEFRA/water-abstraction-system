'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitViewService
 */

const FetchNoticeService = require('../../services/notices/fetch-notice.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewNoticePresenter = require('../../presenters/notices/view-notice.presenter.js')
const ViewValidator = require('../../validators/notices/view.validator.js')

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
  const clearFilters = _clearFilters(payload, yar)

  if (clearFilters) {
    return {}
  }

  const validationResult = _validate(payload)

  if (!validationResult) {
    _save(payload, yar)

    return {}
  }

  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number
  const selectedPageNumber = Number(page)
  const savedFilters = _savedFilters(yar)

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
    error: validationResult,
    errorList: validationResult.errorList,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination,
    totalNumber
  }
}

function _clearFilters(payload, yar) {
  const clearFilters = payload.clearFilters

  if (clearFilters) {
    yar.clear('noticeFilter')

    return true
  }

  return false
}

function _save(payload, yar) {
  yar.set('noticeFilter', {
    status: payload.status,
    licence: payload.licence ?? null,
    recipient: payload.recipient ?? null
  })
}

function _savedFilters(payload) {
  const { clear, get, set, ...noticeFilter } = payload

  return {
    licence: null,
    openFilter: true,
    recipient: null,
    status: null,
    ...noticeFilter
  }
}

function _validate(payload) {
  const validation = ViewValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    const path = detail.path[0]

    result.errorList.push({ href: `#${path}`, text: detail.message })

    result[path] = { message: detail.message }
  })

  return result
}

module.exports = {
  go
}
