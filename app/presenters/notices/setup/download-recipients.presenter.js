'use strict'

/**
 * Formats data for the `/notices/setup/download` link
 * @module DownloadRecipientsPresenter
 */

const { contactName } = require('../../crm.presenter.js')
const { transformArrayToCSVRow } = require('../../../lib/transform-to-csv.lib.js')

const HEADERS = [
  'Licence',
  'Return reference',
  'Return period start date',
  'Return period end date',
  'Return due date',
  'Notification type',
  'Message type',
  'Contact type',
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
 * Formats data for the `/notices/setup/download` link
 *
 * This function takes an array of recipient objects and transforms it into a CSV string suitable for download.
 *
 * The headers are fixed and in the correct order. If a value for a row does not match the header then it will default
 * to an empty string.
 *
 * @param {object[]} recipients - An array of recipients
 * @param {string} notificationType - The selected notification type
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
function go(recipients, notificationType) {
  const rows = _transformToCsv(recipients, notificationType)

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
 * The order of the properties must match the CSV header order.
 *
 * @private
 */
function _transformToCsv(recipients, notificationType) {
  return recipients.map((recipient) => {
    const { contact } = recipient

    const row = [
      recipient.licence_ref,
      recipient.return_reference,
      recipient.start_date,
      recipient.end_date,
      recipient.due_date,
      notificationType,
      contact ? 'letter' : 'email',
      recipient.contact_type,
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
