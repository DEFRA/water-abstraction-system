'use strict'

/**
 * Fetches recipients for renewal invitations
 * @module FetchRenewalRecipients
 */

const GenerateRenewalRecipientsQueryService = require('./generate-renewal-recipients-query.service.js')
const { db } = require('../../../../db/db.js')

/**
 * Fetches recipients for renewal invitations
 *
 * The licence expired date is calculated and provided upstream.
 *
 * @param {Date} expiredDate - The expired date for the licences
 *
 * @returns {Promise<object[]>} - An array of recipients for with an
 */
async function go(expiredDate) {
  // cte licences = revoked, expired or lapsed <= (no on expiry date) - and have as the expiry

  const query = GenerateRenewalRecipientsQueryService.go()

  const { rows } = await db.raw(`${query}`, [expiredDate, expiredDate])

  return rows
}

module.exports = {
  go
}
