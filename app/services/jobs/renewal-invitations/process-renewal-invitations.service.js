import SendRenewalInvitations from './send-renewal-invitations.service.js'
import { currentTimeInNanoseconds, calculateAndLogTimeTaken } from '../../../lib/general.lib.js'

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 * @module ProcessRenewalInvitationsService
 */

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 */
export default async function processRenewalInvitationsService(days) {
  try {
    const startTime = currentTimeInNanoseconds()

    const recipients = await SendRenewalInvitations(days)

    calculateAndLogTimeTaken(startTime, 'Renewals invitation status job complete', { count: recipients.length })
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}
