'use strict'

/**
 * Check the status of a pending notification with Notify and records the result if its been sent or failed to send
 * @module CheckNotificationStatusService
 */

const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')
const NotificationModel = require('../../models/notification.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const ViewMessageDataRequest = require('../../requests/notify/view-message-data.request.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

const NOTIFICATIONS_STATUS = {
  cancelled: 'cancelled',
  error: 'error',
  pending: 'pending',
  sent: 'sent'
}

/**
 * See {@link https://docs.notifications.service.gov.uk/node.html#email-status-descriptions | Notify docs} for more
 *
 * - **created** - GOV.UK Notify has placed the message in a queue, ready to be sent to the provider. It should only
 * remain in this state for a few seconds.
 * - **sending** - GOV.UK Notify has sent the message to the provider. The provider will try to deliver the message to
 * the recipient for up to 72 hours. Notify is waiting for delivery information.
 * - **delivered** - The message was successfully delivered.
 * - **permanent-failure** - The provider could not deliver the message because the email address was wrong. You should
 * remove these email addresses from your database.
 * - **temporary-failure** - The provider could not deliver the message. This can happen when the recipient’s inbox is
 * full or their anti-spam filter rejects your email. Check your content does not look like spam before you try to
 * send the message again.
 * - **technical-failure** - Your message was not sent because there was a problem between Notify and the provider.
 * You’ll have to try sending your messages again.
 */
const EMAIL_STATUS = {
  created: NOTIFICATIONS_STATUS.pending,
  sending: NOTIFICATIONS_STATUS.pending,
  delivered: NOTIFICATIONS_STATUS.sent,
  'permanent-failure': NOTIFICATIONS_STATUS.error,
  'technical-failure': NOTIFICATIONS_STATUS.error,
  'temporary-failure': NOTIFICATIONS_STATUS.error,
  error: NOTIFICATIONS_STATUS.error
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
 */
const LETTER_STATUS = {
  'pending-virus-check': NOTIFICATIONS_STATUS.pending,
  'permanent-failure': NOTIFICATIONS_STATUS.error,
  'technical-failure': NOTIFICATIONS_STATUS.error,
  'temporary-failure': NOTIFICATIONS_STATUS.error,
  'validation-failed': NOTIFICATIONS_STATUS.error,
  accepted: NOTIFICATIONS_STATUS.pending,
  cancelled: NOTIFICATIONS_STATUS.cancelled,
  created: NOTIFICATIONS_STATUS.pending,
  error: NOTIFICATIONS_STATUS.error,
  received: NOTIFICATIONS_STATUS.sent,
  sending: NOTIFICATIONS_STATUS.pending
}

/**
 * Check the status of a pending notification with Notify and records the result if its been sent or failed to send
 *
 * @param {object} notification
 */
async function go(notification) {
  const notifyStatus = await _notifyStatus(notification.notifyId)

  const status = _status(notification, notifyStatus)

  if (status === NOTIFICATIONS_STATUS.pending) {
    return
  }

  await _recordStatus(notification, notifyStatus, status)
  await _recordAlert(status, notification)
  await _recordDueDate(status, notification)
}

async function _notifyStatus(notifyId) {
  const notifyResult = await ViewMessageDataRequest.send(notifyId)

  const { response, succeeded } = notifyResult

  if (succeeded) {
    return response.body.status
  }

  global.GlobalNotifier.omfg('Failed to check Notify status', { notifyId, response })

  return null
}

async function _recordAlert(status, notification) {
  const { createdAt, licenceMonitoringStationId, personalisation } = notification

  // We only record the notification against the licence monitoring station _if_ the notification is sent and we're
  // dealing with an abstraction alert (hence the presence of `licenceMonitoringStationId`)
  if (status !== NOTIFICATIONS_STATUS.sent || !licenceMonitoringStationId) {
    return
  }

  await LicenceMonitoringStationModel.query()
    .patch({
      status: personalisation.sending_alert_type,
      statusUpdatedAt: createdAt
    })
    .findById(licenceMonitoringStationId)
}

async function _recordDueDate(status, notification) {
  const { dueDate, messageRef, returnLogIds } = notification

  // We only record the due date against the linked return log IDs if the notification is 'sent' and the it's a returns
  // invitation
  if (status !== NOTIFICATIONS_STATUS.sent || !messageRef.startsWith('returns_invitation')) {
    return
  }

  await ReturnLogModel.query()
    .patch({ dueDate, updatedAt: timestampForPostgres() })
    .whereNull('dueDate')
    .whereIn('returnId', returnLogIds)
}

async function _recordStatus(notification, notifyStatus, status) {
  await NotificationModel.query().patch({ notifyStatus, status }).findById(notification.id)
}

function _status(notification, notifyStatus) {
  // If we fail to get the status, we return 'pending' which is the same as doing nothing. This means the notification
  // can be checked again the next time the job runs
  if (!notifyStatus) {
    return NOTIFICATIONS_STATUS.pending
  }

  if (notification.messageType === 'email') {
    return EMAIL_STATUS[notifyStatus] || NOTIFICATIONS_STATUS.pending
  }

  return LETTER_STATUS[notifyStatus] || NOTIFICATIONS_STATUS.pending
}

module.exports = {
  go
}
