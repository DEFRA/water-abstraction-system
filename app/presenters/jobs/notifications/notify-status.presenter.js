'use strict'

/**
 * Determines the `status` and `notifyStatus` to apply to a notification after fetching the current status from Notify
 * @module NotifyStatusPresenter
 */

const NOTIFICATIONS_STATUS = {
  error: 'error',
  pending: 'pending',
  sent: 'sent'
}

/**
 * Determines the `status` and `notifyStatus` to apply to a notification after fetching the current status from Notify
 *
 * This is the status rendered in the UI. It has three possible states.
 *
 * - **error** - An error has occurred (initial creation with Notify or a status update returns an error status)
 * - **pending** - When a notification is 'created', 'sending', 'accepted', or 'pending-virus-check'
 * - **sent** - When Notify responds with 'delivered' or 'received'
 *
 * The status is stored in `public.notifications.status`, and 'notifyStatus' in 'public.notifications.notifyStatus'.
 *
 * @param {string} notifyStatus - the fetched status from Notify
 * @param {object} notification - the notification we've fetched the Notify status for
 *
 * @returns {object} - returns what 'status' and 'notifyStatus' should be applied to the notification
 */
function go(notifyStatus, notification) {
  if (notification.messageType === 'email') {
    return _emailStatus(notifyStatus)
  }

  return _letterStatus(notifyStatus)
}

/**
 * See {@link https://docs.notifications.service.gov.uk/node.html#email-status-descriptions | Notify docs} for more
 *
 * - **created** - GOV.UK Notify has placed the message in a queue, ready to be sent to the provider. It should only
 *   remain in this state for a few seconds.
 * - **sending** - GOV.UK Notify has sent the message to the provider. The provider will try to deliver the message to
 *   the recipient for up to 72 hours. Notify is waiting for delivery information.
 * - **delivered** - The message was successfully delivered.
 * - **permanent-failure** - The provider could not deliver the message because the email address was wrong. You should
 *   remove these email addresses from your database.
 * - **temporary-failure** - The provider could not deliver the message. This can happen when the recipient’s inbox is
 *   full or their anti-spam filter rejects your email. Check your content does not look like spam before you try to
 *   send the message again.
 * - **technical-failure** - Your message was not sent because there was a problem between Notify and the provider.
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

  const status = emailStatuses[notifyStatus] || NOTIFICATIONS_STATUS.pending

  return {
    status,
    notifyStatus
  }
}

/**
 * See {@link https://docs.notifications.service.gov.uk/node.html#letter-status-descriptions | Notify docs} for more
 *
 * - **accepted** - GOV.UK Notify has sent the letter to the provider to be printed.
 * - **received** - The provider has printed and dispatched the letter.
 * - **cancelled** - Sending cancelled. The letter will not be printed or dispatched.
 * - **technical-failure** - GOV.UK Notify had an unexpected error while sending the letter to our printing provider.
 * - **permanent-failure** - The provider cannot print the letter. Your letter will not be dispatched.
 * - **pending-virus-check** - GOV.UK Notify has not completed a virus scan of the precompiled letter file.
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
