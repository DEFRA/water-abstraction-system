/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 * @module ProcessNotificationStatusService
 */

import CheckNotificationStatusService from '../../notifications/check-notification-status.service.js'
import FetchNotificationsService from './fetch-notifications.service.js'
import SendAlternateNoticesService from './send-alternate-notices.service.js'
import UpdateNoticeService from '../../notices/update-notice.service.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'

/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 *
 * This function retrieves a list of 'notifications' and iterates over them to update their status according to the
 * latest information from Notify.
 *
 * The updates are done in batches to comply with rate-limiting constraints imposed by the Notify service. The rate
 * limit is set to 3,000 messages per minute, which the service respects during processing.
 *
 * If the number of 'notifications' exceeds the internal batch size limit, the notifications are split into smaller
 * batches for processing. This ensures efficient processing while adhering to the rate limit.
 *
 * If the request to Notify for the message details is successful, the status of the notification is updated. We always
 * record the Notify status in `notifyStatus`. We map it to a WRLS recognised value in `status`.
 *
 * - created or sending = 'pending'
 * - delivered = 'sent'
 * - permanent-failure, temporary-failure, technical-failure or error = 'error'
 *
 * The event record linked to the notification is then updated with the count of notifications with a status of 'error'.
 *
 * If the request to Notify for the message details fails, the notification is not updated. This means we can try again
 * later.
 */
export default async function processNotificationStatusService() {
  try {
    const startTime = currentTimeInNanoseconds()

    const notifications = await FetchNotificationsService()

    for (const notification of notifications) {
      await CheckNotificationStatusService(notification)
    }

    await _updateEventErrorCount(notifications)

    await SendAlternateNoticesService(notifications)

    calculateAndLogTimeTaken(startTime, 'Notification status job complete', { count: notifications.length })
  } catch (error) {
    const message = 'Notification status job failed'

    globalThis.GlobalNotifier.omfg(message, null, error)
    globalThis.GlobalNotifier.redAlert(message)
  }
}

/**
 * We need to dedupe the eventIds to ensure a performant query. Otherwise, we could have hundreds / thousands of
 * notifications with the same event id all triggering the same update.
 *
 * @private
 */
async function _updateEventErrorCount(notifications) {
  const eventIds = notifications.map((notification) => {
    return notification.eventId
  })

  const dedupeEventIds = [...new Set(eventIds)]

  await UpdateNoticeService(dedupeEventIds)
}
