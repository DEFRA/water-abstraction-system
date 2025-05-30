'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the 'notices/{id}' page
 *
 * @param {object[]} notices - The data to be formatted for display
 *
 * @returns {object[]} - The data formatted for the view template
 */
function go(notices) {
  const tableRows = _formatTableData(notices.results)

  return {
    createdBy: notices.event.issuer,
    dateCreated: formatLongDate(notices.event.createdAt),
    reference: notices.event.referenceCode,
    notices: tableRows,
    status: notices.event.status
  }
}

function _formatTableData(data) {
  return data.map((notice) => {
    return {
      recipient: _recipient(notice),
      licenceRefs: notice.licences,
      messageType: notice.messageType,
      status: notice.status
    }
  })
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

module.exports = {
  go
}
