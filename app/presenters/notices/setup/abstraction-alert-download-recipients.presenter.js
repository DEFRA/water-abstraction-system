'use strict'

/**
 * Formats data for the `/notices/setup/download` link when the journey is for 'alerts'
 * @module AbstractionAlertDownloadRecipientsPresenter
 */

const { addressToCSV } = require('../base.presenter.js')
const { formatAbstractionPeriod, formatValueUnit } = require('../../base.presenter.js')
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
  'Address line 1',
  'Address line 2',
  'Address line 3',
  'Address line 4',
  'Address line 5',
  'Address line 6',
  'Address line 7'
]

/**
 * Formats data for the `/notices/setup/download` link when the journey is for 'alerts'
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
 * @param {SessionModel} session - The session instance
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
function go(recipients, session) {
  const rows = _transformToCsv(recipients, session)

  return [HEADERS + '\n', ...rows].join('')
}

/**
 * Matches a recipient to a licence monitoring station by the licence ref.
 *
 * 'recipient.licence_refs' will be a comma seperated string: 'licenceOne,licenceTwo'.
 *
 * To match a recipient to a licence monitoring station we use the 'licenceMonitoringStationLicenceRef' and check if the
 * licence ref is present in the 'recipient.licence_refs' string.
 *
 * @private
 */
function _matchingRecipient(recipients, licenceMonitoringStationLicenceRef) {
  return recipients.filter((recipient) => {
    return recipient.licence_refs.split(',').includes(licenceMonitoringStationLicenceRef)
  })
}

function _row(matchingRecipient, licenceMonitoringStation, notificationType, licenceRef) {
  const { contact } = matchingRecipient

  return [
    licenceRef,
    formatAbstractionPeriod(
      licenceMonitoringStation.abstractionPeriodStartDay,
      licenceMonitoringStation.abstractionPeriodStartMonth,
      licenceMonitoringStation.abstractionPeriodEndDay,
      licenceMonitoringStation.abstractionPeriodEndMonth
    ),
    licenceMonitoringStation.measureType,
    formatValueUnit(licenceMonitoringStation.thresholdValue, licenceMonitoringStation.thresholdUnit),
    notificationType,
    contact ? 'letter' : 'email',
    matchingRecipient.contact_type,
    matchingRecipient.email || '',
    ...addressToCSV(contact)
  ]
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * The order of the properties must match the CSV header order.
 *
 * A recipient could belong to multiple licences. When this happens we receive the 'licence_refs' in a comma seperated
 * string: 'licenceOne,licenceTwo'. The '_matchingRecipient' explains how we match the recipients.
 *
 * When we transform the recipient to a download row we only want to show a single licence ref, this means we use the
 * licence monitoring stations licence ref which has been matched to the string above. This simplifies the code, but
 * is a subtle change worth documenting.
 *
 * @private
 */
function _transformToCsv(recipients, session) {
  const { relevantLicenceMonitoringStations, notificationType } = session

  const rows = []

  for (const licenceMonitoringStation of relevantLicenceMonitoringStations) {
    const licenceMonitoringStationLicenceRef = licenceMonitoringStation.licence.licenceRef

    const matchingRecipients = _matchingRecipient(recipients, licenceMonitoringStationLicenceRef)

    for (const matchingRecipient of matchingRecipients) {
      const row = _row(
        matchingRecipient,
        licenceMonitoringStation,
        notificationType,
        licenceMonitoringStationLicenceRef
      )

      rows.push(transformArrayToCSVRow(row))
    }
  }

  return rows
}

module.exports = {
  go
}
