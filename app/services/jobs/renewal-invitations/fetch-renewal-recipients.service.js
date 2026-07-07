/**
 * Fetches recipients for renewal invitations
 * @module FetchRenewalRecipients
 */

import GenerateExpiringLicencesQueryService from './generate-expiring-licences-query.service.js'
import GenerateRenewalRecipientsQueryService from './generate-renewal-recipients-query.service.js'
import { db } from '../../../../db/db.js'

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

export default {
  go
}
