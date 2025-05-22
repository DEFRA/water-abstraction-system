'use strict'

/**
 * Formats recipients into notifications for an abstraction alert
 * @module AbstractionAlertsNotificationsPresenter
 */

const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../crm.presenter.js')

/**
 *
 * @param recipients
 * @param session
 * @param eventId
 */
function go(recipients, session, eventId) {
  const notifications = []

  const { referenceCode, relevantLicenceMonitoringStations } = session

  for (const lms of relevantLicenceMonitoringStations) {
    const rec = recipients.filter((r) => {
      return r.licence_refs === lms.licence.licenceRef
    })

    for (const recipient of rec) {
      if (recipient.email) {
        notifications.push(_email(recipient, referenceCode, eventId))
      } else {
        notifications.push(_letter(recipient, referenceCode, eventId))
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
  const templateId = _emailTemplate()

  const messageType = 'email'

  return {
    ..._common(referenceCode, templateId, eventId),
    licences: _licences(recipient.licence_refs),
    messageType,
    messageRef: 'water_abstraction_alert_reduce_warning_email',
    personalisation: {},
    recipient: recipient.email
  }
}

function _common(referenceCode, templateId, eventId) {
  const createdAt = timestampForPostgres()

  return {
    createdAt,
    eventId,
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
  const name = contactName(recipient.contact)
  const templateId = _letterTemplate()

  const messageType = 'letter'

  return {
    ..._common(referenceCode, templateId, eventId),
    licences: _licences(recipient.licence_refs),
    messageType,
    messageRef: 'water_abstraction_alert_reduce_warning',
    personalisation: {
      name,
      ..._addressLines(recipient.contact)
    }
  }
}

function _letterTemplate() {
  return notifyTemplates['abstraction-alerts'].reduceWarning
}

//      water_abstraction_alert_reduce_warning: '27499bbd-e854-4f13-884e-30e0894526b6',
//       water_abstraction_alert_reduce_or_stop_warning: '8c77274f-6a61-46a5-82d8-66863320d608',
//       water_abstraction_alert_stop_warning: '7ab10c86-2c23-4376-8c72-9419e7f982bb',
//       water_abstraction_alert_reduce: 'fafe7d77-7710-46c8-b870-3b5c1e3816d2',
//       water_abstraction_alert_reduce_or_stop: '2d81eaa7-0c34-463b-8ac2-5ff37d5bd800',
//       water_abstraction_alert_stop: 'c2635893-0dd7-4fff-a152-774707e2175e',
//       water_abstraction_alert_resume: 'ba6b11ad-41fc-4054-87eb-7e9a168ceec2',
//
//       water_abstraction_alert_reduce_warning_email: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
//       water_abstraction_alert_reduce_or_stop_warning_email: 'bf32327a-f170-4854-8abb-3068aee9cdec',
//       water_abstraction_alert_stop_warning_email: 'a51ace39-3224-4c18-bbb8-c803a6da9a21',
//       water_abstraction_alert_reduce_email: 'd94bf110-b173-4f77-8e9a-cf7b4f95dc00',
//       water_abstraction_alert_reduce_or_stop_email: '4ebf29e1-f819-4d88-b7e4-ee47df302b9a',
//       water_abstraction_alert_stop_email: 'd7468ba1-ac65-42c4-9785-8998f9c34e01',
//       water_abstraction_alert_resume_email: '5eae5e5b-4f9a-4e2e-8d1e-c8d083533fbf',

module.exports = {
  go
}
