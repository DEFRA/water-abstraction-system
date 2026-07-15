/**
 * Orchestrates sending the first main notice to Notify, then checking if an alternate needs creating and sending
 * @module SendNoticeService
 */

import SendAlternateNoticeService from './send-alternate-notice.service.js'
import SendMainNoticeService from './send-main-notice.service.js'
import UpdateNoticeService from '../../update-notice.service.js'
import { NoticeType, NoticeTypes } from '../../../../lib/static-lookups.lib.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../../lib/general.lib.js'

/**
 * Orchestrates sending the first main notice to Notify, then checking if an alternate needs creating and sending
 *
 * @param {object} notice - The main notice to be sent
 * @param {object[]} notifications - The main notifications linked to the main notice to be sent
 */
export default async function sendNoticeService(notice, notifications) {
  try {
    const startTime = currentTimeInNanoseconds()

    const { id: noticeId, subtype } = notice

    await SendMainNoticeService(notice, notifications)

    const noticesToUpdate = [noticeId]

    // We only check if a failed notice is needed if the original notice was a returns or renewal invitation.
    if (
      subtype === NoticeTypes[NoticeType.INVITATIONS].subType ||
      subtype === NoticeTypes[NoticeType.RENEWAL_INVITATIONS].subType
    ) {
      const alternateNotice = await SendAlternateNoticeService(notice)

      if (alternateNotice) {
        noticesToUpdate.push(alternateNotice.id)
      }
    }

    await UpdateNoticeService(noticesToUpdate)

    calculateAndLogTimeTaken(startTime, 'Send notice complete', { count: notifications.length, noticeId })
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Send notice failed', { notice }, error)
  }
}
