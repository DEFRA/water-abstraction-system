/**
 * Check the status of a pending notification with Notify and records the result if its been sent or failed to send
 * @module CheckNotificationStatusService
 */

import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import { NOTIFICATIONS_STATUS } from 'water-abstraction-engine/lib/notifications.lib.js'

import RecordAlertSentDal from '../../dal/licence-monitoring-station/record-alert-sent.dal.js'
import RecordInviteSentDal from '../../dal/return-logs/record-invite-sent.dal.js'
import RecordNotifyErrorDal from '../../dal/notifications/record-notify-error.dal.js'
import SendStatusRequestService from './send-status-request.service.js'
import UpdateStatusDal from '../../dal/notifications/update-status.dal.js'

/**
 * Check the status of a pending notification with Notify and records the result if its been sent or failed to send
 *
 * @param {object} notification
 */
export default async function checkNotificationStatusService(notification) {
  try {
    const notifyResult = await SendStatusRequestService(notification)

    if (notifyResult.status === NOTIFICATIONS_STATUS.pending) {
      return
    }

    if (notifyResult.status === NOTIFICATIONS_STATUS.error) {
      await RecordNotifyErrorDal(notifyResult)

      return
    }

    await _recordStatus(notification, notifyResult)
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Check notification status failed', notification, error)
  }
}

async function _recordAlert(notification, status, trx) {
  const { createdAt, licenceMonitoringStationId, personalisation } = notification

  // We only record the notification against the licence monitoring station _if_ the notification is sent and we're
  // dealing with an abstraction alert (hence the presence of `licenceMonitoringStationId`)
  if (status !== NOTIFICATIONS_STATUS.sent || !licenceMonitoringStationId) {
    return
  }

  await RecordAlertSentDal(licenceMonitoringStationId, personalisation.sending_alert_type, createdAt, trx)
}

async function _recordReturnLogs(notification, status, trx) {
  const { contactType, createdAt, dueDate, messageRef, returnLogIds } = notification

  // If the status was not 'sent' then we make no changes
  if (status !== NOTIFICATIONS_STATUS.sent) {
    return
  }

  // We only apply the due date for certain notice types
  const dueDateApplicableMessageRefs = [
    'paper return',
    'returns invitation',
    'returns invitation ad-hoc',
    'returns invitation alternate'
  ]

  if (!dueDateApplicableMessageRefs.includes(messageRef)) {
    return
  }

  // We only apply the due date for certain contact types
  if (!['licence holder', 'primary user', 'single use'].includes(contactType)) {
    return
  }

  await RecordInviteSentDal(returnLogIds, dueDate, createdAt, trx)
}

async function _recordStatus(notification, notifyResult) {
  const { notifyStatus, status } = notifyResult

  await NotificationModel.transaction(async (trx) => {
    await UpdateStatusDal(notification.id, notifyStatus, status, trx)

    await _recordAlert(notification, status, trx)
    await _recordReturnLogs(notification, status, trx)
  })
}
