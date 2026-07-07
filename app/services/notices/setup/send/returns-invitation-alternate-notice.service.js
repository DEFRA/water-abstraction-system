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
async function go(mainNotice) {
  const { dueDate, licenceRefs, notificationIds, returnLogIds } = await FetchFailedReturnsInvitationsService.go(
    mainNotice.id
  )

  if (notificationIds.length === 0) {
    return null
  }

  const { notice, notifications } = await CreateAlternateReturnsNoticeService.go(
    mainNotice,
    licenceRefs,
    dueDate,
    returnLogIds
  )

  return { notice, notificationIds, notifications }
}

export default {
  go
}
