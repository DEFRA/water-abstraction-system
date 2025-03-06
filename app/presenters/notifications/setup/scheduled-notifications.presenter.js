'use strict'

/**
 * Formats a notification into a 'water.scheduled_notifications'
 * @module ScheduledNotificationPresenter
 */

const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

const CREATED = 201

const INVITATIONS_MESSAGE_REF = {
  [notifyTemplates.returns.invitations.primaryUserEmail]: 'returns_invitation_primary_user_email',
  [notifyTemplates.returns.invitations.returnsAgentEmail]: 'returns_invitation_returns_agent_email',
  [notifyTemplates.returns.invitations.licenceHolderLetter]: 'returns_invitation_licence_holder_letter',
  [notifyTemplates.returns.invitations.returnsToLetter]: 'returns_invitation_returns_to_letter'
}

/**
 * Formats a notification into a 'water.scheduled_notifications'
 *
 * > The legacy code has some columns that are not used for returns notifications:
 * - 'job_id' is null
 * - 'notification_type' is null
 * - 'status_checks' is incremented every time the status is checked with notify (It is not used anywhere else).
 *
 * However, there is a colum 'next_status_check' which is used to trigger a status update check with notify.
 * ```sql
 * AND (next_status_check IS NULL OR next_status_check<=CURRENT_TIMESTAMP)
 * ```
 *
 * @param {object} notification
 * @param {string} journey
 * @param {object} notify - the striped response from out notify services
 * @param {UUID} eventId - the id from the created 'EventModel'
 *
 * @returns {object}
 */
function go(notification, journey, notify, eventId) {
  return {
    eventId,
    messageRef: _messageRef(journey, notification.templateId),
    messageType: 'letter',
    personalisation: _personalisation(notification),
    sendAfter: _sendAfter(),
    ..._notify(notify),
    ..._email(notification)
  }
}

function _email(notification) {
  if (notification.emailAddress) {
    return {
      recipient: notification.emailAddress,
      messageType: 'email'
    }
  } else {
    return {}
  }
}

function _messageRef(journey, templateId) {
  if (journey === 'invitations') {
    return INVITATIONS_MESSAGE_REF[templateId]
  }

  return ''
}

/**
 * When notify errors it does not create an id. Therefore, we do not expect a 'notifyId' when an error occurs.
 *
 * Notify returns a 'statusText' of 'created' which is only used in the legacy code for a successful notify request.
 *
 * Notify does provide 'statusText' with responses like 'BAD REQUEST'. But the legacy code does not use this. So we
 * follow the existing pattern.
 *
 * @private
 */
function _notify(notify) {
  if (notify.status !== CREATED) {
    return _error(notify)
  }

  return {
    notifyId: notify.id,
    notifyStatus: notify.statusText,
    plaintext: notify.plaintext,
    status: _status()
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

/**
 * The legacy code uses this time to send notification and run checks when to attempt to resend if a notification fails.
 *
 * The codd below is a snippet of the scheduled notifications that require a Notify status check.
 *
 * ```javascript
 *  WHERE send_after>(CURRENT_TIMESTAMP - interval '1 week')
 * ```
 *
 * @private
 */
function _sendAfter() {
  return timestampForPostgres()
}

/**
 * The default status is set to 'sent'
 *
 * The legacy code did set the initial status to 'sending' as it would queue up the messages before being triggered to
 * send.
 *
 * If there is an error the status should be set to 'error'.
 *
 * @private
 */
function _status() {
  return 'sent'
}

/**
 * When an errors occur sending to notify we need to capture the error to align with the legacy code.
 *
 * @private
 */
function _error(notify) {
  return {
    log: JSON.stringify(notify),
    status: 'error'
  }
}

module.exports = {
  go
}
