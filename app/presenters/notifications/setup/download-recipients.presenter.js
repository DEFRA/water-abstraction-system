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
    const { contact } = recipient

    return {
      Licences: recipient.licence_ref,
      'Return references': recipient.return_reference,
      'Returns period start date': formatDateObjectToISO(recipient.start_date),
      'Returns period end date': formatDateObjectToISO(recipient.end_date),
      'Returns due date': formatDateObjectToISO(recipient.due_date),
      'Message type': contact ? 'letter' : 'email',
      'Message reference': 'invitations',
      'Licence holder': contact ? contactName(recipient.contact) : '',
      'Recipient name': '',
      Email: recipient.email || '',
      'Address line 1': contact ? contact.addressLine1 : '',
      'Address line 2': contact ? contact.addressLine2 : '',
      'Address line 3': contact ? contact.addressLine3 : '',
      'Address line 4': contact ? contact.addressLine4 : '',
      'Address line 5': contact ? contact.town || contact.county : '',
      'Address line 6': contact ? contact.country : '',
      Postcode: contact ? contact.postcode : ''
    }
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
