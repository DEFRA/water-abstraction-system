/**
 * Formats data for the `/notices/setup/download` link when the journey is for renewal invitations
 * @module DownloadRenewalInvitationPresenter
 */

import { addressToCSV } from '../base.presenter.js'
import { transformArrayToCSVRow } from '../../../lib/transform-to-csv.lib.js'

const HEADERS = [
  'Licence',
  'Renewal date',
  'Expiry date',
  'Notification type',
  'Message type',
  'Contact type',
  'Email',
  'Address line 1',
  'Address line 2',
  'Address line 3',
  'Address line 4',
  'Address line 5',
  'Address line 6',
  'Address line 7'
]

/**
 * Formats data for the `/notices/setup/download` link when the journey is for renewal invitations
 *
 * The headers are fixed and in the correct order. If a value for a row does not match the header then it will default
 * to an empty string.
 *
 * @param {object[]} recipients - An array of recipients
 * @param {SessionModel} session - The session instance
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
export default function downloadRenewalInvitation(recipients, session) {
  const rows = _transformToCsv(recipients, session)

  return [HEADERS + '\n', ...rows].join('')
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the properties must match the CSV header order.
 *
 * @private
 */
function _transformToCsv(recipients, session) {
  const { expiryDate, notificationType, renewalDate } = session

  return recipients.map((recipient) => {
    const { contact } = recipient

    const row = [
      recipient.licence_refs.join(', '),
      new Date(renewalDate),
      new Date(expiryDate),
      notificationType,
      recipient.message_type,
      recipient.contact_type,
      recipient.email || '',
      ...addressToCSV(contact)
    ]

    return transformArrayToCSVRow(row)
  })
}
