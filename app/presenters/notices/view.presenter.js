'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Formats data for the 'notices/{id}' page
 *
 * @param {object[]} notices - The data to be formatted for display
 * @param {number} page - The current page for the pagination service
 *
 * @returns {object[]} - The data formatted for the view template
 */
function go(notices, page = 1) {
  const tableRows = _formatTableData(notices.results, page)
  console.log(notices)
  return {
    createdBy: notices.event.issuer,
    dateCreated: formatLongDate(notices.event.createdAt),
    reference: notices.event.referenceCode,
    notices: tableRows,
    pageTitle: _pageTitle(notices.event.subtype),
    status: _status(tableRows)
  }
}

function _formatTableData(data, page) {
  const to = page === 1 ? DatabaseConfig.defaultPageSize : page * DatabaseConfig.defaultPageSize
  const from = page === 1 ? 0 : to - DatabaseConfig.defaultPageSize
  const rows = data.slice(from, to)

  return rows.map((notice) => {
    return {
      recipient: _recipient(notice),
      licenceRefs: notice.licences,
      messageType: notice.message_type,
      status: notice.status
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

function _recipient(notice) {
  const { personalisation, recipient } = notice

  if (recipient && recipient !== 'n/a') {
    return notice.recipient
  }

  const addressLines = [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6'],
    personalisation['postcode']
  ]

  const filteredAddressLines = addressLines.filter((addressLine) => {
    return !!addressLine
  })

  return filteredAddressLines
}

function _status(notices) {
  if (
    notices.some((notice) => {
      return notice.status === 'error'
    })
  ) {
    return 'error'
  }

  if (
    notices.some((notice) => {
      return notice.status === 'pending'
    })
  ) {
    return 'pending'
  }

  return 'sent'
}

module.exports = {
  go
}
