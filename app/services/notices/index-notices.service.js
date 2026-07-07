/**
 * Orchestrates presenting the data for `/notices` page
 * @module IndexNoticesService
 */

import FetchNoticesService from './fetch-notices.service.js'
import NoticesIndexPresenter from '../../presenters/notices/index-notices.presenter.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { processSavedFilters } from '../../lib/submit-page.lib.js'

/**
 * Orchestrates presenting the data for `/notices` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the notices page
 */
async function go(yar, auth, page) {
  const filters = _filters(yar)

  const { results: notices, total: totalNumber } = await FetchNoticesService.go(filters, page)

  const pagination = PaginatorPresenter.go(totalNumber, page, `/system/notices`, notices.length, 'notices')

  const pageData = NoticesIndexPresenter.go(notices, auth)

  return {
    activeNavBar: 'notices',
    filters,
    ...pageData,
    pagination
  }
}

function _filters(yar) {
  const savedFilters = processSavedFilters(yar, 'noticesFilter')

  return {
    fromDate: null,
    noticeTypes: [],
    reference: null,
    sentBy: null,
    statuses: [],
    toDate: null,
    ...savedFilters
  }
}

export default {
  go
}
