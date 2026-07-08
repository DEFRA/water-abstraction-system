/**
 * Fetches failed returns invitation notifications and creates an alternate notice for them
 * @module ReturnsInvitationAlternateNoticeService
 */

import CreateAlternateReturnsNoticeService from '../create-alternate-returns-notice.service.js'
import FetchFailedReturnsInvitationsService from '../returns-notice/fetch-failed-returns-invitations.service.js'

/**
 * Fetches failed returns invitation notifications and creates an alternate notice for them
 *
 * @param {object} mainNotice - The main notice to check for failed returns invitation emails
 *
 * @returns {Promise<object|null>} The notice, notifications, and failed notification IDs, or null if none failed
 */
export default async function go(mainNotice) {
  const { dueDate, licenceRefs, notificationIds, returnLogIds } = await FetchFailedReturnsInvitationsService(
    mainNotice.id
  )

  if (notificationIds.length === 0) {
    return null
  }

  const { notice, notifications } = await CreateAlternateReturnsNoticeService(
    mainNotice,
    licenceRefs,
    dueDate,
    returnLogIds
  )

  return { notice, notificationIds, notifications }
}
