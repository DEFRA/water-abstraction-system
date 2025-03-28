'use strict'

/**
 * Formats data for the `/notifications` page
 * @module ViewNotificationsPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/notifications` page
 *
 * @param {object} data - The object containing the notifcations sent
 * @param {object} filter - The object containing the notifcation filters
 * @param {object} validateResult - The object containing any validation errors
 *
 * @returns {object} - The data formatted for the view template
 */
function go(data, filter, validateResult) {
  return {
    backLink: '/manage',
    error: validateResult,
    filter,
    headers: _tableHeaders(),
    rows: _tableRows(data),
    pageTitle: 'View sent notices'
  }
}

function _tableHeaders() {
  return [
    {
      text: 'Date'
    },
    {
      text: 'Notification type'
    },
    {
      text: 'Sent by'
    },
    {
      text: 'Recipients'
    },
    {
      text: 'Problems'
    }
  ]
}

function _tableRows(data) {
  const rows = []

  for (const notification of data) {
    const name = notification.alertType === 'warning' ? 'Warning - ' + notification.name : notification.name
    rows.push([
      { text: formatLongDate(notification.createdAt) },
      { html: `<a href="/notifications/report/${notification.id}">${name}</a>` },
      { text: notification.issuer },
      { text: notification.recipientCount, format: 'numeric' },
      { text: notification.errorCount, format: 'numeric' }
    ])
  }

  return rows
}

module.exports = {
  go
}
