'use strict'

/**
 * Orchestrates presenting the data for `/notices` page
 * @module IndexNoticesService
 */

const FetchNoticesService = require('./fetch-notices.service.js')
const NoticesIndexPresenter = require('../../presenters/notices/index-notices.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates presenting the data for `/notices` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the notices page
 */
async function go(yar, auth, page = 1) {
  const filters = _filters(yar)

  const selectedPageNumber = Number(page)

  const { results: notices, total: totalNumber } = await FetchNoticesService.go(filters, selectedPageNumber)

  const pagination = PaginatorPresenter.go(totalNumber, selectedPageNumber, `/system/notices`)

  const pageData = NoticesIndexPresenter.go(notices, totalNumber, auth)

  return {
    activeNavBar: 'manage',
    filters,
    ...pageData,
    pagination
  }
}

function _filters(yar) {
  let openFilter = false

  const savedFilters = yar.get('noticesFilter')

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      if (['noticeTypes', 'statuses'].includes(key)) {
        openFilter = savedFilters[key].length > 0
      } else {
        openFilter = !!savedFilters[key]
      }

      if (openFilter) {
        break
      }
    }
  }

  return {
    fromDate: null,
    noticeTypes: [],
    reference: null,
    sentBy: null,
    statuses: [],
    toDate: null,
    ...savedFilters,
    openFilter
  }
}

module.exports = {
  go
}
