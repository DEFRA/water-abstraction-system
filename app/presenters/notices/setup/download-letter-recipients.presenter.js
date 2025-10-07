'use strict'

/**
 * Formats data for the `/notices/setup/download` link
 * @module DownloadLetterRecipientsPresenter
 */

const { addressToCSV } = require('../base.presenter.js')
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
  'Address line 1',
  'Address line 2',
  'Address line 3',
  'Address line 4',
  'Address line 5',
  'Address line 6',
  'Address line 7'
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
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
function go(recipients, session) {
  const { dueReturns, licenceRef, selectedReturns } = session

  const selectedDueReturns = _selectedDueReturns(selectedReturns, dueReturns)

  let rows = []

  for (const dueReturn of selectedDueReturns) {
    rows = [...rows, ..._transformToCsv(recipients, dueReturn, licenceRef)]
  }

  return [HEADERS + '\n', ...rows].join('')
}

/**
 * The session contains the due returns for the licence.
 *
 * The user must select at least one due return to progress in the journey. Any selected due return will be stored in
 * 'selectedReturns'. As the recipients are for the licence, we need to show the recipient with each due return. This
 * means the csv can appear to have duplicate recipients, but these will be aligned to different due returns.
 *
 * @private
 */
function _selectedDueReturns(selectedReturns, dueReturns) {
  return dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the properties must match the CSV header order.
 *
 * @private
 */
function _transformToCsv(recipients, dueReturn, licenceRef) {
  return recipients.map((recipient) => {
    const { contact } = recipient

    const row = [
      licenceRef,
      dueReturn.returnReference,
      new Date(dueReturn.startDate),
      new Date(dueReturn.endDate),
      new Date(dueReturn.dueDate),
      'Paper return',
      'letter',
      recipient.contact_type,
      ...addressToCSV(contact)
    ]

    return transformArrayToCSVRow(row)
  })
}

module.exports = {
  go
}
