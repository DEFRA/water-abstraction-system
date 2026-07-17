/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @module ViewNoticeService
 */

import FetchNoticeService from '../../services/notices/fetch-notice.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import ViewNoticePresenter from '../../presenters/notices/view-notice.presenter.js'
import { processSavedFilters } from '../../lib/submit-page.lib.js'

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @param {string} noticeId - The UUID of the selected notice
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewNoticeService(noticeId, yar, page) {
  const filterKey = `noticeFilter-${noticeId}`
  const filters = _filters(yar, filterKey)

  const { notice, notifications, totalNumber } = await FetchNoticeService(noticeId, filters, page)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/notices/${notice.id}`,
    notifications.length,
    'notifications'
  )

  const pageData = ViewNoticePresenter(notice, notifications)

  return {
    activeNavBar: 'notices',
    filters,
    ...pageData,
    pagination,
    totalNumber
  }
}

function _filters(yar, filterKey) {
  const savedFilters = processSavedFilters(yar, filterKey)

  return {
    licence: null,
    recipient: null,
    status: null,
    ...savedFilters
  }
}
