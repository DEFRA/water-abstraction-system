'use strict'

/**
 * Formats the status from Notify Status
 * @module NotifyStatusPresenter
 */

const NOTIFICATIONS_STATUS = {
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
 * - **sent** - when a notification is in any other state it is considered sent
 *
 * This 'display status' is stored in 'water.notifications.status'
 *
 * We also store the raw 'notifyStatus' in 'water.notifications.notifyStatus'
 *
 * When we make the initial call to notify we do not receive a status, but we do receive a 'statusCode' (201) and
 * 'statusText' ("CREATED"). This is inferred to mean the notifications is in the "created" state. This is the initial
 * 'notifyStatus' value set for a 'notification' (when no error has occurred), and the 'status' is set to
 * pending.
 *
 * @param {string} notifyStatus - the status from notify
 * @param {string} notification - a 'notification'
 *
 * @returns {object} - updates 'status' and 'notifyStatus' for a notification
 */
function go(notifyStatus, notification) {
  if (notification.messageType === 'email') {
    return _emailStatus(notifyStatus)
  } else {
    return _letterStatus(notifyStatus)
  }
}

/**
 * https://docs.notifications.service.gov.uk/node.html#email-status-descriptions
 *
 * - **created**: GOV.UK Notify has placed the message in a queue, ready to be sent to the provider.
 *   It should only remain in this state for a few seconds.
 * - **sending**: GOV.UK Notify has sent the message to the provider. The provider will try to deliver
 *   the message to the recipient for up to 72 hours. Notify is waiting for delivery information.
 * - **delivered**: The message was successfully delivered.
 * - **permanent-failure**: The provider could not deliver the message because the email address was wrong.
 *   You should remove these email addresses from your database.
 * - **temporary-failure**: The provider could not deliver the message. This can happen when the recipient’s
 *   inbox is full or their anti-spam filter rejects your email. Check your content does not look like spam
 *   before you try to send the message again.
 * - **technical-failure**: Your message was not sent because there was a problem between Notify and the provider.
 *   You’ll have to try sending your messages again.
 *
 * @private
 */
function _emailStatus(notifyStatus) {
  const emailStatuses = {
    created: NOTIFICATIONS_STATUS.pending,
    sending: NOTIFICATIONS_STATUS.pending,
    delivered: NOTIFICATIONS_STATUS.sent,
    'permanent-failure': NOTIFICATIONS_STATUS.error,
    'technical-failure': NOTIFICATIONS_STATUS.error,
    'temporary-failure': NOTIFICATIONS_STATUS.error,
    error: NOTIFICATIONS_STATUS.error
  }

  return {
    status: emailStatuses[notifyStatus],
    notifyStatus
  }
}

/**
 * https://docs.notifications.service.gov.uk/node.html#letter-status-descriptions
 *
 * - **accepted**: GOV.UK Notify has sent the letter to the provider to be printed.
 * - **received**: The provider has printed and dispatched the letter.
 * - **cancelled**: Sending cancelled. The letter will not be printed or dispatched.
 * - **technical-failure**: GOV.UK Notify had an unexpected error while sending the letter to our printing provider.
 * - **permanent-failure**: The provider cannot print the letter. Your letter will not be dispatched.
 * - **pending-virus-check**: GOV.UK Notify has not completed a virus scan of the precompiled letter file.
 *
 * @private
 */
function _letterStatus(notifyStatus) {
  const letterStatuses = {
    'pending-virus-check': NOTIFICATIONS_STATUS.pending,
    'permanent-failure': NOTIFICATIONS_STATUS.error,
    'technical-failure': NOTIFICATIONS_STATUS.error,
    'temporary-failure': NOTIFICATIONS_STATUS.error,
    'validation-failed': NOTIFICATIONS_STATUS.error,
    accepted: NOTIFICATIONS_STATUS.pending,
    created: NOTIFICATIONS_STATUS.pending,
    error: NOTIFICATIONS_STATUS.error,
    received: NOTIFICATIONS_STATUS.sent,
    sending: NOTIFICATIONS_STATUS.pending
  }

  const status = letterStatuses[notifyStatus] || NOTIFICATIONS_STATUS.pending

  return {
    status,
    notifyStatus
  }
}

module.exports = {
  go
}
