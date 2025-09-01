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
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(noticeId, page) {
  const selectedPageNumber = page ? Number(page) : 1

  const { notice, notifications, totalNumber } = await FetchNoticeService.go(noticeId, selectedPageNumber)

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
    ...pageData,
    pagination,
    totalNumber
  }
}

module.exports = {
  go
}
