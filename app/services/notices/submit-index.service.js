'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexService
 */

const FetchNoticesService = require('./fetch-notices.service.js')
const NoticesIndexPresenter = require('../../presenters/notices/index-notices.presenter.js')
const IndexValidator = require('../../validators/notices/index.validator.js')
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

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _save(payload, yar)

    return {}
  }

  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number
  const selectedPageNumber = Number(page)

  const savedFilters = _savedFilters(yar)
  const { results, total: numberOfNotices } = await FetchNoticesService.go(savedFilters, selectedPageNumber)

  const pageData = await NoticesIndexPresenter.go(results, numberOfNotices)
  const pagination = PaginatorPresenter.go(numberOfNotices, selectedPageNumber, `/system/notices`)
  const pageTitle = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination,
    pageTitle
  }
}

function _clearFilters(payload, yar) {
  const clearFilters = payload.clearFilters

  if (clearFilters) {
    yar.clear('noticesFilter')

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
function _handleOneOptionSelected(payload) {
  if (!payload?.noticeTypes) {
    payload.noticeTypes = []

    return
  }

  if (!Array.isArray(payload?.noticeTypes)) {
    payload.noticeTypes = [payload?.noticeTypes]
  }
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Notices'
  }

  return `Notices (page ${selectedPageNumber} of ${numberOfPages})`
}

function _save(payload, yar) {
  yar.set('noticesFilter', {
    noticeTypes: payload.noticeTypes,
    fromDate: payload.fromDate,
    sentBy: payload.sentBy ?? null,
    sentFromDay: payload.sentFromDay ?? null,
    sentFromMonth: payload.sentFromMonth ?? null,
    sentFromYear: payload.sentFromYear ?? null,
    sentToDay: payload.sentToDay ?? null,
    sentToMonth: payload.sentToMonth ?? null,
    sentToYear: payload.sentToYear ?? null,
    toDate: payload.toDate
  })
}

function _savedFilters(yar) {
  const savedFilters = yar.get('noticesFilter')

  return {
    fromDate: null,
    noticeTypes: [],
    openFilter: true,
    sentBy: null,
    toDate: null,
    ...savedFilters
  }
}

function _validate(payload) {
  const validation = IndexValidator.go(payload)

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
