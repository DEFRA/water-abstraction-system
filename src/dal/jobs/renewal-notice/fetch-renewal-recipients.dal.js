/**
 * Fetches recipients for renewal notices
 * @module FetchRenewalRecipients
 */

import { db } from 'water-abstraction-engine/db/db.js'

import GenerateExpiringLicencesQueryDal from './generate-expiring-licences-query.dal.js'
import GenerateRenewalRecipientsQueryDal from './generate-renewal-recipients-query.dal.js'

/**
 * Fetches recipients for renewal notices
 *
 * @param {Date} expiredDate - The expired date for the licences
 *
 * @returns {Promise<object[]>} - An array of recipients linked to an expiring licence
 */
export default async function fetchRenewalRecipientsDal(expiredDate) {
  const { bindings, query: expiringLicencesQuery } = GenerateExpiringLicencesQueryDal(expiredDate)

  const query = GenerateRenewalRecipientsQueryDal(expiringLicencesQuery)

  const { rows } = await db.raw(query, bindings)

  return rows
}
