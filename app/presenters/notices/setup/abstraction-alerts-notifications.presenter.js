'use strict'

/**
 * Formats recipients into notifications for an abstraction alert
 * @module AbstractionAlertsNotificationsPresenter
 */

const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../crm.presenter.js')

/**
 * Formats recipients into notifications for an abstraction alert
 *
 * @param {object[]} recipients
 * @param {SessionModel} session - The session instance
 * @param {string} eventId
 *
 * @returns {object[]} notifications
 */
function go(recipients, session, eventId) {
  const notifications = []

  const { referenceCode, relevantLicenceMonitoringStations } = session

  for (const licenceMonitoringStation of relevantLicenceMonitoringStations) {
    const matchingRecipients = recipients.filter((recipient) => {
      return recipient.licence_refs === licenceMonitoringStation.licence.licenceRef
    })

    for (const matchingRecipient of matchingRecipients) {
      if (matchingRecipient.email) {
        notifications.push(_email(matchingRecipient, referenceCode, eventId))
      } else {
        notifications.push(_letter(matchingRecipient, referenceCode, eventId))
      }
    }
  }

  return notifications
}

function _addressLines(contact) {
  const address = contactAddress(contact)

  const addressLines = {}

  for (const [index, value] of address.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

function _email(recipient, referenceCode, eventId) {
  const createdAt = timestampForPostgres()

  const templateId = _emailTemplate()

  const messageType = 'email'

  return {
    createdAt,
    eventId,
    licences: _licences(recipient.licence_refs),
    messageRef: 'water_abstraction_alert_reduce_warning_email',
    messageType,
    personalisation: {},
    recipient: recipient.email,
    reference: referenceCode,
    templateId
  }
}

function _emailTemplate() {
  return notifyTemplates['abstraction-alerts'].reduceWarningEmail
}

function _licences(licenceRefs) {
  const formattedRecipients = transformStringOfLicencesToArray(licenceRefs)

  return JSON.stringify(formattedRecipients)
}

function _letter(recipient, referenceCode, eventId) {
  const createdAt = timestampForPostgres()

  const name = contactName(recipient.contact)

  const templateId = _letterTemplate()

  const messageType = 'letter'

  return {
    createdAt,
    eventId,
    licences: _licences(recipient.licence_refs),
    messageRef: 'water_abstraction_alert_reduce_warning',
    messageType,
    personalisation: {
      name,
      ..._addressLines(recipient.contact)
    },
    reference: referenceCode,
    templateId
  }
}

function _letterTemplate() {
  return notifyTemplates['abstraction-alerts'].reduceWarning
}

module.exports = {
  go
}
