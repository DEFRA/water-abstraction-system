'use strict'

/**
 * Formats the status from Notify Status
 * @module NotifyStatusPresenter
 */

const SCHEDULED_NOTIFICATIONS_STATUS = {
  pending: 'pending',
  sent: 'sent',
  error: 'error'
}

/**
 * Formats the status from Notify Status
 *
 * The legacy code has the concept of a 'display status'. This is the status rendered in the UI. It has three possible
 * states:
 * - **error** - Any error has occurred (initial creation with notify or a status update returns an error)
 * - **pending** - when a notification is 'created' or 'sending'
 * - **sent** - when a notification is any other state is considered sent
 *
 * We store the 'status' in 'water.scheduled_notifications.status'
 *
 * We also store the raw 'notifyStatus' in 'water.scheduled_notifications.notifyStatus'
 *
 * > GOV.UK Notify has a retention period of 7 days. Whilst out system should not be checking statuses past this date it
 * is technically possible to receive a status update where notfication id does not exisit:
 *
 * ```javascript
 * [{
 *  "error": "ValidationError",
 *  "message": "id is not a valid UUID"
 * }]
 * ```
 *
 * https://docs.notifications.service.gov.uk/node.html#get-the-status-of-one-message-error-codes
 *
 *
 * When we make the initial call to notify we do not receive a status, but we do receive a 'statusCode' (201) and
 * 'statusText' ("CREATED"). This is inferred to mean the notifications is in the "created" state. This is the initial
 * 'notifyStatus' value set for a 'scheduledNotification' (when no error has occurred).
 *
 *
 * @param {string} notifyStatus - the status from notify
 * @param {string} scheduledNotification - a 'scheduled notification'
 *
 * @returns {object} - updates 'status' and 'notifyStatus' for a scheduled notification
 */
function go(notifyStatus, scheduledNotification) {
  if (scheduledNotification.messageType === 'email') {
    return _emailStatus(notifyStatus)
  } else {
    return _letterStatus(notifyStatus)
  }
}

/**
 * https://docs.notifications.service.gov.uk/node.html#email-status-descriptions
 *
 * | Status             | Description                                                                                                                                           |
 * |--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | created            | GOV.UK Notify has placed the message in a queue, ready to be sent to the provider. It should only remain in this state for a few seconds.              |
 * | sending            | GOV.UK Notify has sent the message to the provider. The provider will try to deliver the message to the recipient for up to 72 hours. Notify is waiting for delivery information. |
 * | delivered          | The message was successfully delivered.                                                                                                                |
 * | permanent-failure  | The provider could not deliver the message because the email address was wrong. You should remove these email addresses from your database.           |
 * | temporary-failure  | The provider could not deliver the message. This can happen when the recipient’s inbox is full or their anti-spam filter rejects your email. Check your content does not look like spam before you try to send the message again. |
 * | technical-failure  | Your message was not sent because there was a problem between Notify and the provider. You’ll have to try sending your messages again.                |
 *
 * @private
 */
function _emailStatus(notifyStatus) {
  const emailStatuses = {
    created: SCHEDULED_NOTIFICATIONS_STATUS.pending,
    sending: SCHEDULED_NOTIFICATIONS_STATUS.pending,
    delivered: SCHEDULED_NOTIFICATIONS_STATUS.sent,
    'permanent-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    'technical-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    'temporary-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    error: SCHEDULED_NOTIFICATIONS_STATUS.error
  }

  return {
    status: emailStatuses[notifyStatus],
    notifyStatus
  }
}

/**
 *
 * A letter also returns the created status text to match the 201 - do we need to change this ?
 *
 * https://docs.notifications.service.gov.uk/node.html#letter-status-descriptions
 *
 * | Status            | Description                                                                              |
 * |-------------------|----------------------------------------------------------------------------------------  |
 * | accepted          | GOV.UK Notify has sent the letter to the provider to be printed.                         |
 * | received          | The provider has printed and dispatched the letter.                                      |
 * | cancelled         | Sending cancelled. The letter will not be printed or dispatched.                         |
 * | technical-failure | GOV.UK Notify had an unexpected error while sending the letter to our printing provider. |
 * | permanent-failure | The provider cannot print the letter. Your letter will not be dispatched.                |
 *
 * @private
 */
function _letterStatus(notifyStatus) {
  const letterStatuses = {
    accepted: SCHEDULED_NOTIFICATIONS_STATUS.sent,
    created: SCHEDULED_NOTIFICATIONS_STATUS.pending,
    sending: SCHEDULED_NOTIFICATIONS_STATUS.pending,
    delivered: SCHEDULED_NOTIFICATIONS_STATUS.sent,
    received: SCHEDULED_NOTIFICATIONS_STATUS.sent,
    'permanent-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    'technical-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    'temporary-failure': SCHEDULED_NOTIFICATIONS_STATUS.error,
    'validation-failed': SCHEDULED_NOTIFICATIONS_STATUS.error,
    error: SCHEDULED_NOTIFICATIONS_STATUS.error
  }

  return {
    status: letterStatuses[notifyStatus],
    notifyStatus
  }
}

module.exports = {
  go
}
