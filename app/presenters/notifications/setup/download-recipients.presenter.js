'use strict'

/**
 * Formats data for the `/notifications/setup/download` link
 * @module DownloadRecipientsPresenter
 */

const { contactName } = require('../../crm.presenter.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { transformArrayToCSVRow } = require('../../../lib/transform-to-csv.lib.js')

/**
 * Formats data for the `/notifications/setup/download` link.
 *
 * This function takes an array of recipient objects and transforms it into a CSV
 * string suitable for download.
 *
 * The headers are fixed and in the correct order. If a value for a row does not match the header then it will default
 * to an empty string.
 *
 * @param {object[]} recipients - An array of recipients
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first
 * row as column headers and subsequent rows corresponding to the recipient details.
 */
function go(recipients) {
  const formattedData = _transformForCsv(recipients)
  return _transformJsonToCsv(formattedData)
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the object dictates the CSV header order.
 *
 * @private
 */
function _transformForCsv(recipients) {
  return recipients.map((recipient) => {
    const common = {
      Licences: recipient.licence_ref,
      'Return references': recipient.return_reference,
      'Returns period start date': formatDateObjectToISO(recipient.start_date),
      'Returns period end date': formatDateObjectToISO(recipient.end_date),
      'Returns due date': formatDateObjectToISO(recipient.due_date),
      'Message type': 'email',
      'Message reference': 'invitations',
      'Licence holder': '',
      'Recipient name': '',
      Email: recipient.email || '',
      'Address line 1': '',
      'Address line 2': '',
      'Address line 3': '',
      'Address line 4': '',
      'Address line 5': '',
      'Address line 6': '',
      Postcode: ''
    }

    if (recipient.contact) {
      common['Message type'] = 'letter'
      common['Licence holder'] = contactName(recipient.contact)
      common['Address line 1'] = recipient.contact.addressLine1
      common['Address line 2'] = recipient.contact.addressLine2
      common['Address line 3'] = recipient.contact.addressLine3
      common['Address line 4'] = recipient.contact.addressLine4
      common['Address line 5'] = recipient.contact.town || recipient.contact.county
      common['Address line 6'] = recipient.contact.country
      common['Postcode'] = recipient.contact.postcode
    }

    return common
  })
}

/**
 * Transforms an array of JSON objects into a CSV string.
 *
 * This function takes an array of JSON objects and transforms it into a CSV string.
 * The keys of the objects become the column headers, and the values become the rows
 * corresponding to each header. The output will be a standard CSV format with the
 * first row containing the headers.
 *
 * Where rows do no have values they will default to an empty string.
 *
 * @private
 */
function _transformJsonToCsv(jsonArray) {
  const headers = transformArrayToCSVRow(Object.keys(jsonArray[0]))

  const rows = jsonArray.map((obj) => {
    const row = Object.values(obj)
    return transformArrayToCSVRow(row)
  })

  return [headers, ...rows].join('')
}

module.exports = {
  go
}
