'use strict'

/**
 * Handles the returns-invitation-specific logic for creating an alternate notice
 * @module ReturnsInvitationAlternateNoticeService
 */

const CreateAlternateNoticeService = require('../create-alternate-notice.service.js')
const FetchFailedReturnsInvitationsService = require('../returns-notice/fetch-failed-returns-invitations.service.js')

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

  const { notice, notifications } = await CreateAlternateNoticeService.go(
    mainNotice,
    dueDate,
    licenceRefs,
    returnLogIds
  )

  return { notice, notificationIds, notifications }
}

module.exports = {
  go
}
