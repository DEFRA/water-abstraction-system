'use strict'

/**
 * Formats recipients into notifications for an abstraction alert
 * @module AbstractionAlertNotificationsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { NOTIFY_TEMPLATES } = require('../../../lib/notify-templates.lib.js')

/**
 * Formats recipients into notifications for an abstraction alert
 *
 * The notifications returned are intended to both be persisted to the DB and used to formulate the request to Notify.
 *
 * Iterates over all relevant licence monitoring stations in the session and matches recipients based on licence
 * references.
 *
 * For each matching recipient, it generates either an email or a letter notification, depending on the presence of the
 * recipient's email.
 *
 * The iteration is necessary to:
 * - Ensure that notifications are only generated for recipients linked to the specific monitoring stations involved in
 * the session.
 * - Allow for multiple recipients per licence monitoring station.
 *
 * Each licence monitoring station has a licence, multiple stations can be related to the same licence, This means that
 * a recipient can / will receive multiple notifications from different licence monitoring stations.
 *
 * @param {object} session - The session instance
 * @param {object[]} recipients - List of recipients, each containing details like email or address of the recipient
 * @param {string} noticeId - The UUID of the notice these notifications should be linked to
 *
 * @returns {object[]} the recipients transformed into notifications
 */
function go(session, recipients, noticeId) {
  const notifications = []

  const {
    alertEmailAddress,
    alertType,
    monitoringStationName,
    monitoringStationRiverName,
    relevantLicenceMonitoringStations
  } = session

  for (const station of relevantLicenceMonitoringStations) {
    const commonPersonalisation = _commonPersonalisation(
      station,
      monitoringStationName,
      alertEmailAddress,
      monitoringStationRiverName,
      alertType
    )

    const matchingRecipients = _matchingRecipients(recipients, station)

    for (const matchingRecipient of matchingRecipients) {
      let notification

      if (matchingRecipient.email) {
        notification = _email(matchingRecipient, noticeId, commonPersonalisation, alertType, station.restrictionType)
      } else {
        notification = _letter(matchingRecipient, noticeId, commonPersonalisation, alertType, station.restrictionType)
      }

      notifications.push(notification)
    }
  }

  return notifications
}

/**
 * All the Water Abstraction Alerts templates require the same personalisation data:
 *
 * ```javascript
 *  {
 *    alertType: 'stop
 *    condition_text: '',
 *    flow_or_level: 'flow',
 *    issuer_email_address: 'defra@admin.gov.uk',
 *    label: 'Death star',
 *    licenceGaugingStationId: '0a8e59f1-305a-4866-b3f7-143ba5bcf5fb',
 *    licenceId: '94511891-9d40-48cb-aa3f-1d6ff4434dc4',
 *    licenceRef: '01/123,
 *    monitoring_station_name: 'Death star',
 *    sending_alert_type: 'resume',
 *    source: '',
 *    thresholdUnit: 'm3/s',
 *    thresholdValue: 100
 *  }
 * ```
 *
 * 'condition_text' can be empty, the templates is structured so when it's empty is does not affect the copy.
 *
 * In the case of a letter, the address is also required.
 *
 * The 'licenceGaugingStationId' and 'sendingAlertType' are not required for Notify, we use them to update the licence
 * monitoring 'status_updated_at' and 'status' field.
 *
 * @private
 */

function _commonPersonalisation(
  licenceMonitoringStation,
  monitoringStationName,
  alertEmailAddress,
  monitoringStationRiverName,
  sendingAlertType
) {
  return {
    alertType: licenceMonitoringStation.restrictionType,
    condition_text: _conditionText(licenceMonitoringStation.notes),
    flow_or_level: licenceMonitoringStation.measureType,
    issuer_email_address: alertEmailAddress,
    label: monitoringStationName,
    licenceGaugingStationId: licenceMonitoringStation.id,
    licenceId: licenceMonitoringStation.licence.id,
    licenceRef: licenceMonitoringStation.licence.licenceRef,
    monitoring_station_name: monitoringStationName,
    sending_alert_type: sendingAlertType,
    source: _source(monitoringStationRiverName),
    thresholdUnit: licenceMonitoringStation.thresholdUnit,
    thresholdValue: licenceMonitoringStation.thresholdValue
  }
}

function _conditionText(notes) {
  return notes ? `Effect of restriction: ${notes}` : ''
}

/**
 * An email notification requires an email address alongside the expected payload:
 *
 * ```javascript
 *   {
 *      emailAddress: 'hello@world.com
 *      options: {
 *       personalisation: {
 *           condition_text: '',
 *           flow_or_level: 'flow',
 *           issuer_email_address: 'defra@admin.gov.uk',
 *           licence_ref: recipients.licenceHolder.licence_refs,
 *           monitoring_station_name: 'Death star',
 *           source: '',
 *           threshold_unit: 'm3/s',
 *           threshold_value: 100
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 *    }
 * ```
 *
 * A notification saves the 'emailAddress' as 'recipient' and so is used as the variables name.
 *
 * @private
 */
function _email(recipient, eventId, commonPersonalisation, alertType, restrictionType) {
  const messageType = 'email'

  return {
    contactType: recipient.contact_type,
    eventId,
    licenceMonitoringStationId: commonPersonalisation.licenceGaugingStationId,
    licences: [commonPersonalisation.licenceRef],
    messageRef: _messageRef(alertType, restrictionType),
    messageType,
    personalisation: commonPersonalisation,
    recipient: recipient.email,
    status: 'pending',
    templateId: _templateId(alertType, restrictionType, 'email')
  }
}

/**
 * A letter notification requires an address alongside the expected payload:
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *        //The address must have at least 3 lines.
 *        "address_line_1": "Amala Bird", // required string
 *        "address_line_2": "123 High Street", // required string
 *        "address_line_3": "Richmond upon Thames", // required string
 *        "address_line_4": "Middlesex",
 *        "address_line_5": "SW14 6BF",  // last line of address you include must be a postcode or a country name  outside the UK
 *        name: 'test', // matches the template placeholder {{ name }}
 *       },
 *       reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 *     }
 * ```
 *
 * **The notify api has been updated to expect the
 * [postcode as the last address line.](https://docs.notifications.service.gov.uk/node.html#send-a-letter-arguments)**
 *
 * @private
 */
function _letter(recipient, eventId, commonPersonalisation, alertType, restrictionType) {
  const messageType = 'letter'
  const address = NotifyAddressPresenter.go(recipient.contact)

  return {
    contactType: recipient.contact_type,
    eventId,
    licenceMonitoringStationId: commonPersonalisation.licenceGaugingStationId,
    licences: [commonPersonalisation.licenceRef],
    messageRef: _messageRef(alertType, restrictionType),
    messageType,
    personalisation: {
      ...address,
      ...commonPersonalisation,
      // NOTE: Address line 1 is always set to the recipient's name
      name: address.address_line_1
    },
    status: 'pending',
    templateId: _templateId(alertType, restrictionType, 'letter')
  }
}

/**
 * Matches a recipient to a licence monitoring station by the licence ref.
 *
 * 'recipient.licence_refs' will be a comma seperated string: 'licenceOne,licenceTwo'.
 *
 * To match a recipient to a licence monitoring station we use the licence monitoring stations licenceRef and check if
 * the licence ref is present in the 'recipient.licence_refs' string.
 *
 * This does mean that a recipient can / will receive multiple notifications from different licence monitoring stations.
 *
 * @private
 */
function _matchingRecipients(recipients, station) {
  return recipients.filter((recipient) => {
    return recipient.licence_refs.includes(station.licence.licenceRef)
  })
}

function _messageRef(alertType, restrictionType) {
  if (alertType === 'resume') {
    return 'abstraction alert resume'
  }

  if (alertType === 'reduce') {
    return restrictionType === 'stop_or_reduce' ? 'abstraction alert reduce or stop' : 'abstraction alert reduce'
  }

  if (alertType === 'stop') {
    return 'abstraction alert stop'
  }

  if (alertType === 'warning') {
    if (restrictionType === 'reduce') {
      return 'abstraction alert reduce warning'
    }

    if (restrictionType === 'stop_or_reduce') {
      return 'abstraction alert reduce or stop warning'
    }

    if (restrictionType === 'stop') {
      return 'abstraction alert stop warning'
    }
  }

  return 'abstraction alert'
}

function _templateId(alertType, restrictionType, type) {
  if (alertType === 'resume') {
    return NOTIFY_TEMPLATES.alerts[type].resume
  }

  if (alertType === 'reduce') {
    return restrictionType === 'stop_or_reduce'
      ? NOTIFY_TEMPLATES.alerts[type].reduceOrStop
      : NOTIFY_TEMPLATES.alerts[type].reduce
  }

  if (alertType === 'stop') {
    return NOTIFY_TEMPLATES.alerts[type].stop
  }

  if (alertType === 'warning') {
    if (restrictionType === 'reduce') {
      return NOTIFY_TEMPLATES.alerts[type].reduceWarning
    }

    if (restrictionType === 'stop_or_reduce') {
      return NOTIFY_TEMPLATES.alerts[type].reduceOrStopWarning
    }

    if (restrictionType === 'stop') {
      return NOTIFY_TEMPLATES.alerts[type].stopWarning
    }
  }

  return null
}

/**
 * The source is derived from the monitoring stations river name.
 *
 * This can be in three states (from the db):
 * - string - normally the name of the river
 * - '' an empty string
 * - null
 *
 * When the river name is null or '' we do no want to show this in the notify template. So we set it to an empty string
 * which tells notify to ignore the field.
 *
 * @private
 */
function _source(monitoringStationRiverName) {
  return monitoringStationRiverName ? `* Source of supply: ${monitoringStationRiverName}` : ''
}

module.exports = {
  go
}
