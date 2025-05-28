'use strict'

/**
 * Formats data for the `/notices/setup/download` link when the journey is for 'abstraction-alert'
 * @module AbstractionAlertDownloadRecipientsPresenter
 */

const { contactName } = require('../../crm.presenter.js')
const { formatAbstractionPeriod } = require('../../base.presenter.js')
const { transformArrayToCSVRow } = require('../../../lib/transform-to-csv.lib.js')

const HEADERS = [
  'Licence',
  'Abstraction periods',
  'Measure type',
  'Threshold',
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
 * Formats data for the `/notices/setup/download` link when the journey is for 'abstraction-alert'
 *
 * A licence monitoring station can share the same licence reference as other stations. As a result, recipients may
 * receive multiple notifications for the same licence but from different monitoring stations. This leads to duplicate
 * entries in the recipient list. When generating a CSV download, it reflects the same list of recipients as those who
 * will be notified.
 *
 * The distinguishing factors between these "duplicates" are the measure type and threshold values.
 *
 * The headers are fixed and in the correct order. If a value for a row does not match the header then it will default
 * to an empty string.
 *
 * @param {object[]} recipients - An array of recipients
 * @param {object} session -
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
function go(recipients, session) {
  const rows = _transformToCsv(recipients, session)

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

function _row(matchingRecipient, licenceMonitoringStation, notificationType) {
  const { contact } = matchingRecipient

  return [
    matchingRecipient.licence_refs,
    formatAbstractionPeriod(
      licenceMonitoringStation.abstractionPeriodStartDay,
      licenceMonitoringStation.abstractionPeriodStartMonth,
      licenceMonitoringStation.abstractionPeriodEndDay,
      licenceMonitoringStation.abstractionPeriodEndMonth
    ),
    licenceMonitoringStation.measureType,
    `${licenceMonitoringStation.thresholdValue} ${licenceMonitoringStation.thresholdUnit}`,
    notificationType,
    contact ? 'letter' : 'email',
    matchingRecipient.contact_type,
    matchingRecipient.email || '',
    contact ? contactName(matchingRecipient.contact) : '',
    ..._address(contact)
  ]
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the properties must match the CSV header order.
 *
 * @private
 */
function _transformToCsv(recipients, session) {
  const { relevantLicenceMonitoringStations, notificationType } = session

  const rows = []

  for (const licenceMonitoringStation of relevantLicenceMonitoringStations) {
    const matchingRecipients = recipients.filter((recipient) => {
      return recipient.licence_refs === licenceMonitoringStation.licence.licenceRef
    })

    for (const matchingRecipient of matchingRecipients) {
      const row = _row(matchingRecipient, licenceMonitoringStation, notificationType)

      rows.push(transformArrayToCSVRow(row))
    }
  }

  return rows
}

module.exports = {
  go
}
