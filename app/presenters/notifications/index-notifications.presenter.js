'use strict'

/**
 * Formats data for the `/notifications` page
 * @module NotificationsIndexPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/notifications` page
 *
 * @param {object} data - The object containing the notifcations sent
 *
 * @returns {object} - The data formatted for the view template
 */
function go(data) {
  return {
    backLink: '/manage',
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
  return data.map((notification) => {
    const name = notification.alertType === 'warning' ? `Warning - ${notification.name}` : notification.name

    return [
      { text: formatLongDate(notification.createdAt) },
      { html: `<a href="/notifications/report/${notification.id}">${name}</a>` },
      { text: notification.issuer },
      { text: notification.recipientCount, format: 'numeric' },
      { html: notification.errorCount ? `<strong class="govuk-tag govuk-tag--orange">ERROR</strong>` : '' }
    ]
  })
}

module.exports = {
  go
}
