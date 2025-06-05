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

  if (!notices) {
    return {
      activeNavBar: 'manage',
      pageTitle: _pageTitle()
    }
  }

  const { results } = notices
  const selectedPageNumber = page ? Number(page) : 1
  const defaultPageSize = DatabaseConfig.defaultPageSize
  const numberShowing = results.length < defaultPageSize ? results.length : defaultPageSize

  const pagination = PaginatorPresenter.go(results.length, selectedPageNumber, `/system/notices/${notices.event.id}`)

  const pageData = ViewPresenter.go(notices, page)

  return {
    activeNavBar: 'manage',
    ...pageData,
    numberOfRecipients: results.length,
    numberShowing,
    pagination,
    pageNumbers: _numberOfNotifications(pagination.numberOfPages, selectedPageNumber),
    pageTitle: _pageTitle(notices.event.subtype)
  }
}

function _pageTitle(subtype) {
  if (subtype === 'returnInvitation') {
    return 'Returns invitations'
  }

  if (subtype === 'returnReminder') {
    return 'Returns reminders'
  }

  if (subtype === 'adHocReminder') {
    return 'Ad-hoc notice'
  }

  if (subtype === 'waterAbstractionAlerts') {
    return 'Water abstraction alert'
  }

  return 'Notifications'
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
