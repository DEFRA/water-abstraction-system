'use strict'

/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/notices` page
 *
 * @param {object} data - The object containing the notices to display
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
      text: 'Notice type'
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
  return data.map((notice) => {
    const name = notice.alertType === 'warning' ? `Warning - ${notice.name}` : notice.name

    return [
      { text: formatLongDate(notice.createdAt) },
      { html: `<a href="/notifications/report/${notice.id}">${name}</a>` },
      { text: notice.issuer },
      { text: notice.recipientCount, format: 'numeric' },
      { html: notice.errorCount ? `<strong class="govuk-tag govuk-tag--orange">ERROR</strong>` : '' }
    ]
  })
}

module.exports = {
  go
}
