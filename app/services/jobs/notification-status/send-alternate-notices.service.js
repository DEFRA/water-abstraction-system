/**
 * Orchestrates sending alternate notices when a critical notice has failed notifications to primary users
 * @module SendAlternateNoticesService
 */

import FetchCriticalNoticesDal from '../../../dal/jobs/notification-status/fetch-critical-notices.dal.js'
import SendAlternateNoticeService from '../../notices/setup/send/send-alternate-notice.service.js'

/**
 * Orchestrates sending alternate notices when a critical notice has failed notifications to primary users
 *
 * Once the main job has completed checking and updating the status for any pending notifications, we need to check if
 * any of them have failed and were for a critical notice type (renewals and returns invitations).
 *
 * Specifically, it's failed emails to primary users we care about. If these fail we are expected to send an alternate
 * letter notification to the licence's licence holder recipient.
 *
 * When a user sends a notice through the UI, the system automatically does this check having sent all the notifications
 * to Notify and then pausing. In 99% of cases, we'll know then whether an alternate notice is needed.
 *
 * But if Notify is under heavy lead, then some emails may still be 'pending' when that check happens, which means
 * they'll be picked up by the notification-status job. This performs the same checks and sends the same alternate
 * notice, and is a fall back for those rare times the failed email wasn't handled by the initial check.
 *
 * @param {module:NotificationModel[]} notifications - The notifications that have been checked for status by the
 * notification-status job
 */
export default async function sendAlternateNotices(notifications) {
  const noticeIds = _noticeIds(notifications)
  const criticalNotices = await FetchCriticalNoticesDal(noticeIds)

  if (criticalNotices.length === 0) {
    return
  }

  for (const criticalNotice of criticalNotices) {
    await SendAlternateNoticeService(criticalNotice)
  }
}

function _noticeIds(notifications) {
  const allNoticeIds = notifications.map((notification) => {
    return notification.eventId
  })

  return [...new Set(allNoticeIds)]
}
