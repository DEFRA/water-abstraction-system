'use strict'

/**
 * Handles the renewal-invitation-specific logic for creating an alternate notice
 * @module RenewalInvitationAlternateNoticeService
 */

const CreateAlternateNoticeService = require('../create-alternate-notice.service.js')
const FetchFailedRenewalInvitationsService = require('../renewal-notice/fetch-failed-renewal-invitations.service.js')

/**
 * Fetches failed renewal invitation notifications and creates an alternate notice for them
 *
 * @param {object} mainNotice - The main notice to check for failed renewal invitation emails
 *
 * @returns {Promise<object|null>} The notice, notifications, and failed notification IDs, or null if none failed
 */
async function go(mainNotice) {
  const { licenceRefs, notificationIds } = await FetchFailedRenewalInvitationsService.go(mainNotice.id)

  if (notificationIds.length === 0) {
    return null
  }

  const { expiryDate: expiryDateIso, renewalDate: renewalDateIso } = mainNotice.metadata
  const expiryDate = new Date(expiryDateIso)
  const renewalDate = new Date(renewalDateIso)

  const { notice, notifications } = await CreateAlternateNoticeService.go(mainNotice, licenceRefs, {
    expiryDate,
    renewalDate
  })

  return { notice, notificationIds, notifications }
}

module.exports = {
  go
}
