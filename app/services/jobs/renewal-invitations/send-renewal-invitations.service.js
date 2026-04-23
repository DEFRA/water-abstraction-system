'use strict'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

const FetchRenewalRecipients = require('./fetch-renewal-recipients.service.js')

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 *
 * @returns {Promise<object[]>} An array of renewal invitation recipients
 */
async function go(days) {
  const expiryDate = _expiryDate(days)

  const recipients = await FetchRenewalRecipients.go(expiryDate)

  return recipients
}

/**
 * Calculates the target expiry date
 *
 * @private
 */
function _expiryDate(futureExpiredDate) {
  const targetDate = new Date()

  targetDate.setDate(targetDate.getDate() + futureExpiredDate)

  targetDate.setHours(0, 0, 0, 0)

  return targetDate
}

module.exports = {
  go
}
