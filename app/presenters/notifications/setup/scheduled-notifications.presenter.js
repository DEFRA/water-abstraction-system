'use strict'

/**
 * Formats a notification into a 'water.scheduled_notifications'
 * @module ScheduledNotificationPresenter
 */

const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')

const INVITATIONS_MESSAGE_REF = {
  [notifyTemplates.returns.invitations.primaryUserEmail]: 'returns_invitation_primary_user_email',
  [notifyTemplates.returns.invitations.returnsAgentEmail]: 'returns_invitation_returns_agent_email',
  [notifyTemplates.returns.invitations.licenceHolderLetter]: 'returns_invitation_licence_holder_letter',
  [notifyTemplates.returns.invitations.returnsToLetter]: 'returns_invitation_returns_to_letter'
}

//   returnReminder: {
//     [CONTACT_ROLE_PRIMARY_USER]: emailTemplate('returns_reminder_primary_user_email'),
//     [CONTACT_ROLE_RETURNS_AGENT]: emailTemplate('returns_reminder_returns_agent_email'),
//     [CONTACT_ROLE_LICENCE_HOLDER]: letterTemplate('returns_reminder_licence_holder_letter'),
//     [CONTACT_ROLE_RETURNS_TO]: letterTemplate('returns_reminder_returns_to_letter')
//   }
// }

/**
 * Formats a notification into a 'water.scheduled_notifications'
 *
 * @param {object} notification
 * @param {string} journey
 *
 * @returns {object}
 */
function go(notification, journey) {
  const scheduledNotification = {
    messageType: 'letter',
    messageRef: _messageRef(journey, notification.templateId),
    personalisation: _personalisation(notification)
  }

  _email(notification, scheduledNotification)

  return scheduledNotification
}

/**
 * The basic 'water.scheduled_notifications' structure os the same for a 'letter' and 'email' bar the fields below.
 *
 * @private
 */
function _email(notification, scheduledNotification) {
  if (notification.emailAddress) {
    scheduledNotification.recipient = notification.emailAddress
    scheduledNotification.messageType = 'email'
  }
}

function _messageRef(journey, templateId) {
  if (journey === 'invitations') {
    return INVITATIONS_MESSAGE_REF[templateId]
  }
}

/**
 * The 'personalisation' object is put straight into 'water.scheduled_notifications.personalisation' as jsonb.
 *
 * The legacy UI renders this straight into the view.
 *
 * @private
 */
function _personalisation(notification) {
  return notification.options.personalisation
}
module.exports = {
  go
}
