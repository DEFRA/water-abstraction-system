/**
 * Fetches recipients for renewal invitations
 * @module FetchRenewalRecipients
 */

import { db } from 'water-abstraction-engine/db/db.js'

import GenerateExpiringLicencesQueryService from './generate-expiring-licences-query.service.js'
import GenerateRenewalRecipientsQueryService from './generate-renewal-recipients-query.service.js'

/**
 * Fetches recipients for renewal invitations
 *
 * @param {Date} expiredDate - The expired date for the licences
 *
 * @returns {Promise<object[]>} - An array of recipients linked to an expiring licence
 */
export default async function fetchRenewalRecipientsService(expiredDate) {
  const { bindings, query: expiringLicencesQuery } = GenerateExpiringLicencesQueryService(expiredDate)

  const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

  const { rows } = await db.raw(query, bindings)

  return rows
}
