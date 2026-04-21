'use strict'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

const FetchRenewalRecipients = require('./fetch-renewal-recipients.service.js')

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 *
 * @returns {Promise<object[]>} An array of renewal invitation recipients
 */
async function go() {
  const expiryDate = _expiryDate()

  const recipients = await FetchRenewalRecipients.go(expiryDate)

  return recipients
}

/**
 * Calculates the target expiry date for the daily renewal job.
 */
function _expiryDate() {
  const targetDate = new Date()

  const futureExpiredDate = 300

  // 1. Add 300 calendar days to the current system date
  targetDate.setDate(targetDate.getDate() + futureExpiredDate)

  // 2. Normalize time to midnight for clean comparison
  targetDate.setHours(0, 0, 0, 0)

  return targetDate
}

module.exports = {
  go
}
