'use strict'

/**
 * Fetches recipients for renewal invitations
 * @module FetchRenewalRecipients
 */

const GenerateExpiredLicencesQueryService = require('./generate-expired-licences-query.service.js')
const GenerateRenewalRecipientsQueryService = require('./generate-renewal-recipients-query.service.js')
const { db } = require('../../../../db/db.js')

/**
 * Fetches recipients for renewal invitations
 *
 * @param {Date} expiredDate - The expired date for the licences
 *
 * @returns {Promise<object[]>} - An array of recipients for with an
 */
async function go(expiredDate) {
  const expiredLicencesQuery = GenerateExpiredLicencesQueryService.go()

  const query = GenerateRenewalRecipientsQueryService.go(expiredLicencesQuery)

  const { rows } = await db.raw(query, [expiredDate])

  return rows
}

module.exports = {
  go
}
