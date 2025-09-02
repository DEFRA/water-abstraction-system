'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @module ViewNoticeService
 */

const FetchNoticeService = require('../../services/notices/fetch-notice.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewNoticePresenter = require('../../presenters/notices/view-notice.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @param {string} noticeId - The UUID of the selected notice
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(noticeId, yar, page) {
  const filters = _filters(yar)

  const selectedPageNumber = page ? Number(page) : 1

  const { notice, notifications, totalNumber } = await FetchNoticeService.go(noticeId, selectedPageNumber, filters)

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
    filters,
    ...pageData,
    pagination,
    totalNumber
  }
}

function _filters(yar) {
  let openFilter = false

  const savedFilters = yar.get('noticeFilter')

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      openFilter = !!savedFilters[key]

      if (openFilter) {
        break
      }
    }
  }

  return {
    licence: null,
    openFilter,
    recipient: null,
    status: null,
    ...savedFilters
  }
}

module.exports = {
  go
}
