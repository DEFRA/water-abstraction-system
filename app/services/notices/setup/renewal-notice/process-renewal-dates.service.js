'use strict'

/**
 * Calculates the expiry and renewal dates for a renewal notice
 * @module ProcessRenewalDates
 */

/**
 * Calculates the expiry and renewal dates for a renewal notice
 *
 * The expiry date is `days` from today, normalised to midnight. The renewal date is 90 days before the expiry date.
 *
 * @param {number} [days=0] - The number of days from today for the expiry date
 *
 * @returns {object} The calculated expiry and renewal dates
 */
function go(days = 0) {
  const expiryDate = _expiryDate(days)
  const renewalDate = _renewalDate(expiryDate)

  return {
    expiryDate,
    renewalDate
  }
}

function _expiryDate(futureExpiredDate) {
  const targetDate = new Date()

  targetDate.setDate(targetDate.getDate() + Number(futureExpiredDate))

  targetDate.setHours(0, 0, 0, 0)

  return targetDate
}

function _renewalDate(expiryDate) {
  const daysPriorToExpiry = 90

  const renewalDate = new Date(expiryDate)

  renewalDate.setDate(renewalDate.getDate() - daysPriorToExpiry)

  return renewalDate
}

module.exports = {
  go
}
