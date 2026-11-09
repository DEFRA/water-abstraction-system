import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from 'water-abstraction-engine/lib/general.lib.js'

import SendRenewalNotice from './send-renewal-notice.service.js'

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitation, reminder and final notifications
 * @module ProcessRenewalNoticeService
 */

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitation, reminder and final notifications
 *
 * @param {string} requestedNoticeType - The type of renewal notice (invitations, reminders, finals) requested
 */
export default async function processRenewalNoticeService(requestedNoticeType) {
  try {
    const startTime = currentTimeInNanoseconds()

    const recipients = await SendRenewalNotice(requestedNoticeType)

    calculateAndLogTimeTaken(startTime, 'Renewals notice job complete', { count: recipients.length })
  } catch (error) {
    const message = 'Renewals notice job failed'

    globalThis.GlobalNotifier.omfg(message, null, error)
    globalThis.GlobalNotifier.redAlert(message)
  }
}
