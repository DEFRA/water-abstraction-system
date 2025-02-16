'use strict'

/**
 * Formats data for the `/notifications/setup/download` link
 * @module DownloadRecipientsPresenter
 */

const { contactName } = require('../../crm.presenter.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { transformArrayToCSVRow } = require('../../../lib/transform-to-csv.lib.js')

const HEADERS = [
  'Licence',
  'Return references',
  'Returns period start date',
  'Returns period end date',
  'Returns due date',
  'Message type',
  'Message reference',
  'Email',
  'Recipient name',
  'Address line 1',
  'Address line 2',
  'Address line 3',
  'Address line 4',
  'Address line 5',
  'Address line 6',
  'Postcode'
]

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
  const rows = _transformToCsv(recipients)

  return [HEADERS + '\n', ...rows].join('')
}

function _address(contact) {
  if (!contact) {
    return ['', '', '', '', '', '', '']
  }

  return [
    contact.addressLine1,
    contact.addressLine2,
    contact.addressLine3,
    contact.addressLine4,
    contact.town || contact.county,
    contact.country,
    contact.postcode
  ]
}
/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the object dictates the CSV header order.
 *
 * @private
 */
function _transformToCsv(recipients) {
  return recipients.map((recipient) => {
    const { contact } = recipient

    const row = [
      recipient.licence_ref,
      recipient.return_reference,
      formatDateObjectToISO(recipient.start_date),
      formatDateObjectToISO(recipient.end_date),
      formatDateObjectToISO(recipient.due_date),
      contact ? 'letter' : 'email',
      'invitations',
      recipient.email || '',
      contact ? contactName(recipient.contact) : '',
      ..._address(contact)
    ]

    return transformArrayToCSVRow(row)
  })
}

module.exports = {
  go
}
