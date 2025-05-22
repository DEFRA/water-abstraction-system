'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @module ViewService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const FetchNoticeService = require('../../services/notices/fetch-notice.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewPresenter = require('../../presenters/notices/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @param {string} id - The uuid of the notice we are viewing
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(id, page) {
  const notices = await FetchNoticeService.go(id, page)

  const { results, total: numberOfRecipients } = notices
  const selectedPageNumber = page ? Number(page) : 1
  const defaultPageSize = DatabaseConfig.defaultPageSize
  const numberShowing = results.length < defaultPageSize ? results.length : defaultPageSize

  const pagination = PaginatorPresenter.go(
    numberOfRecipients,
    selectedPageNumber,
    `/system/notices/${results[0].event.id}`
  )
  const pageNumbers = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  const pageData = ViewPresenter.go(results, page)

  return {
    ...pageData,
    numberOfRecipients,
    numberShowing,
    pagination,
    pageNumbers
  }
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return null
  }

  return `Showing page ${selectedPageNumber} of ${numberOfPages} notifications`
}

module.exports = {
  go
}
