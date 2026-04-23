'use strict'

/**
 * Fetches recipients for renewal invitations
 * @module FetchRenewalRecipients
 */

const GenerateExpiringLicencesQueryService = require('./generate-expiring-licences-query.service.js')
const GenerateRenewalRecipientsQueryService = require('./generate-renewal-recipients-query.service.js')
const { db } = require('../../../../db/db.js')

/**
 * Fetches recipients for renewal invitations
 *
 * @param {Date} expiredDate - The expired date for the licences
 *
 * @returns {Promise<object[]>} - An array of recipients linked to an expiring licence
 */
async function go(expiredDate) {
  const { bindings, query: expiringLicencesQuery } = GenerateExpiringLicencesQueryService.go(expiredDate)

  const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
