'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the 'notices/{id}' page
 *
 * @param {object[]} data - The data to be formatted for display
 * @param {number|string} page - The currently selected page
 *
 * @returns {object[]} - The data formatted for the view template
 */
function go(data, page) {
  const tableRows = _formatTableData(data)

  return {
    createdBy: data[0].event.issuer,
    dateCreated: formatLongDate(data[0].event.createdAt),
    reference: data[0].event.referenceCode,
    notices: tableRows,
    status: data[0].event.status
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
