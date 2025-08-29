'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewNoticePresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Formats data for the 'notices/{id}' page
 *
 * @param {object} notice - The notice object
 * @param {object[]} notifications - The data to be formatted for display
 * @param {number} page - The current page for the pagination service
 *
 * @returns {object[]} - The data formatted for the view template
 */
function go(notice, notifications, page = 1) {
  const tableRows = _formatTableData(notifications, page)

  return {
    backLink: { href: '/system/notices', text: 'Go back to notices' },
    createdBy: notice.issuer,
    dateCreated: formatLongDate(notice.createdAt),
    reference: notice.referenceCode,
    notices: tableRows,
    pageTitle: _pageTitle(notice.subtype),
    pageTitleCaption: `Notice ${notice.referenceCode}`,
    status: _status(notifications)
  }
}

function _formatTableData(notifications, page) {
  const to = page === 1 ? DatabaseConfig.defaultPageSize : page * DatabaseConfig.defaultPageSize
  const from = page === 1 ? 0 : to - DatabaseConfig.defaultPageSize
  const rows = notifications.slice(from, to)

  return rows.map((notification) => {
    return {
      recipient: _recipient(notification),
      licenceRefs: notification.licences,
      messageType: notification.messageType,
      status: notification.status
    }
  })
}

function _pageTitle(subtype) {
  if (subtype === 'paperReturnForms') {
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

function _recipient(notification) {
  const { messageType, personalisation, recipientName } = notification

  if (messageType === 'email') {
    return [recipientName]
  }

  return [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6'],
    personalisation['address_line_7'],
    personalisation['postcode']
  ].filter(Boolean)
}

function _status(notifications) {
  const erroredNotifications = notifications.some((notice) => {
    return notice.status === 'error'
  })

  if (erroredNotifications) {
    return 'error'
  }

  const pendingNotifications = notifications.some((notice) => {
    return notice.status === 'pending'
  })

  if (pendingNotifications) {
    return 'pending'
  }

  return 'sent'
}

module.exports = {
  go
}
