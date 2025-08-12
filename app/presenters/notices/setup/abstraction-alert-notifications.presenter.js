'use strict'

/**
 * Formats recipients into notifications for an abstraction alert
 * @module AbstractionAlertNotificationsPresenter
 */

const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../crm.presenter.js')

/**
 * Formats recipients into notifications for an abstraction alert
 *
 * Iterates over all relevant licence monitoring stations in the session and matches recipients based on licence
 * references.
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
 * The output of this function is designed to be used directly for both notification delivery and persistent storage.
 *
 * @param {object[]} recipients
 * @param {SessionModel} session - The session instance
 * @param {string} eventId
 *
 * @returns {object[]} notifications
 */
function go(recipients, session, eventId) {
  const notifications = []

  const {
    alertEmailAddress,
    alertType,
    monitoringStationName,
    monitoringStationRiverName,
    referenceCode,
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
      if (matchingRecipient.email) {
        notifications.push(
          _email(matchingRecipient, referenceCode, eventId, commonPersonalisation, alertType, station.restrictionType)
        )
      } else {
        notifications.push(
          _letter(matchingRecipient, referenceCode, eventId, commonPersonalisation, alertType, station.restrictionType)
        )
      }
    }
  }

  return notifications
}

/**
 * Notify expects address lines to be formatted into: 'address_line_1'
 *
 * @private
 */
function _addressLines(contact, name) {
  const address = contactAddress(contact)

  const fullContact = [name, ...address]

  const addressLines = {}

  for (const [index, value] of fullContact.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

/**
 * All the Water Abstraction Alerts templates require the same personalisation data:
 *
 * ```javascript
 *  {
 *    condition_text: '',
 *    flow_or_level: 'flow',
 *    issuer_email_address: 'defra@admin.gov.uk',
 *    licence_ref: recipients.licenceHolder.licence_refs,
 *    monitoring_station_name: 'Death star',
 *    source: '',
 *    threshold_unit: 'm3/s',
 *    threshold_value: 100
 *  }
 * ```
 *
 * 'condition_text' can be empty, the templates is structured so when it's empty is does not affect the copy.
 *
 * In the case of a letter, the address is also required.
 *
 * The 'licenceMonitoringStationId' and 'alertType' are not required for Notify, we use them to update the licence
 * monitoring 'status_updated_at' and 'status' field.
 *
 * @private
 */

function _commonPersonalisation(
  licenceMonitoringStation,
  monitoringStationName,
  alertEmailAddress,
  monitoringStationRiverName,
  alertType
) {
  return {
    alertType,
    licenceMonitoringStationId: licenceMonitoringStation.id,
    condition_text: _conditionText(licenceMonitoringStation.notes),
    flow_or_level: licenceMonitoringStation.measureType,
    issuer_email_address: alertEmailAddress,
    licence_ref: licenceMonitoringStation.licence.licenceRef,
    monitoring_station_name: monitoringStationName,
    source: _source(monitoringStationRiverName),
    threshold_unit: licenceMonitoringStation.thresholdUnit,
    threshold_value: licenceMonitoringStation.thresholdValue
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
function _email(recipient, referenceCode, eventId, commonPersonalisation, alertType, restrictionType) {
  const createdAt = timestampForPostgres()

  const messageType = 'email'

  return {
    createdAt,
    eventId,
    licences: _licences(commonPersonalisation.licence_ref),
    messageRef: _emailMessageRef(alertType, restrictionType),
    messageType,
    personalisation: commonPersonalisation,
    recipient: recipient.email,
    reference: referenceCode,
    templateId: _templateId(alertType, restrictionType, 'email')
  }
}

function _emailMessageRef(alertType, restrictionType) {
  return `${_messageRef(alertType, restrictionType)}_email`
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
function _letter(recipient, referenceCode, eventId, commonPersonalisation, alertType, restrictionType) {
  const createdAt = timestampForPostgres()

  const name = contactName(recipient.contact)

  const messageType = 'letter'

  return {
    createdAt,
    eventId,
    licences: _licences(commonPersonalisation.licence_ref),
    messageRef: _messageRef(alertType, restrictionType),
    messageType,
    personalisation: {
      ..._addressLines(recipient.contact, name),
      ...commonPersonalisation,
      name
    },
    reference: referenceCode,
    templateId: _templateId(alertType, restrictionType, 'letter')
  }
}

/**
 * All the 'licences' associated with a notification are stored in 'water.scheduled_notifications'
 *
 * These licences are stored as 'jsonb' so we need to stringify the array to match the legacy schema.
 *
 * @private
 */
function _licences(licenceRefs) {
  const formattedRecipients = transformStringOfLicencesToArray(licenceRefs)

  return JSON.stringify(formattedRecipients)
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
    return recipient.licence_refs.split(',').includes(station.licence.licenceRef)
  })
}

function _messageRef(alertType, restrictionType) {
  if (alertType === 'resume') {
    return 'water_abstraction_alert_resume'
  }

  if (alertType === 'reduce') {
    return restrictionType === 'stop_or_reduce'
      ? 'water_abstraction_alert_reduce_or_stop'
      : 'water_abstraction_alert_reduce'
  }

  if (alertType === 'stop') {
    return 'water_abstraction_alert_stop'
  }

  if (alertType === 'warning') {
    if (restrictionType === 'reduce') {
      return 'water_abstraction_alert_reduce_warning'
    }

    if (restrictionType === 'stop_or_reduce') {
      return 'water_abstraction_alert_reduce_or_stop_warning'
    }

    if (restrictionType === 'stop') {
      return 'water_abstraction_alert_stop_warning'
    }
  }

  return 'water_abstraction_alert'
}

function _templateId(alertType, restrictionType, type) {
  if (alertType === 'resume') {
    return notifyTemplates.alerts[type].resume
  }

  if (alertType === 'reduce') {
    return restrictionType === 'stop_or_reduce'
      ? notifyTemplates.alerts[type].reduceOrStop
      : notifyTemplates.alerts[type].reduce
  }

  if (alertType === 'stop') {
    return notifyTemplates.alerts[type].stop
  }

  if (alertType === 'warning') {
    if (restrictionType === 'reduce') {
      return notifyTemplates.alerts[type].reduceWarning
    }

    if (restrictionType === 'stop_or_reduce') {
      return notifyTemplates.alerts[type].reduceOrStopWarning
    }

    if (restrictionType === 'stop') {
      return notifyTemplates.alerts[type].stopWarning
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
