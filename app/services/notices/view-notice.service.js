'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @module ViewNoticeService
 */

const DatabaseConfig = require('../../../config/database.config.js')
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
  const { notice, notifications } = await FetchNoticeService.go(noticeId)

  const selectedPageNumber = page ? Number(page) : 1
  const defaultPageSize = DatabaseConfig.defaultPageSize
  const numberShowing = notifications.length < defaultPageSize ? notifications.length : defaultPageSize

  const pagination = PaginatorPresenter.go(notifications.length, selectedPageNumber, `/system/notices/${notice.id}`)

  const pageData = ViewNoticePresenter.go(notice, notifications, page)

  return {
    activeNavBar: 'manage',
    ...pageData,
    numberOfRecipients: notifications.length,
    numberShowing,
    pagination,
    pageNumbers: _numberOfNotifications(pagination.numberOfPages, selectedPageNumber)
  }
}

function _numberOfNotifications(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Showing all notifications'
  }

  return `Showing page ${selectedPageNumber} of ${numberOfPages} notifications`
}

module.exports = {
  go
}
