/**
 * Fetch all licences linked to the given company via their licence version holders
 * @module FetchCompanyLicencesDal
 */

import { currentLicenceVersionsJoin } from '../notices/recipient-queries.dal.js'
import { db } from '../../../db/db.js'
import { timestampForPostgres } from '../../lib/general.lib.js'

/**
 * Fetch all licences linked to the given company via their licence version holders
 *
 * @param {string} companyId - The UUID of the company to fetch licences for
 *
 * @returns {Promise<object[]>} An array of licence objects with `id` and `licenceRef`, sorted by `licenceRef`
 */
export default async function (companyId) {
  const query = `
  SELECT
    l.id,
    l.licence_ref as "licenceRef"
  FROM licences l
  ${currentLicenceVersionsJoin}
  WHERE
    (l.expired_date IS NULL OR l.expired_date > ?)
    AND (l.lapsed_date IS NULL OR l.lapsed_date > ?)
    AND (l.revoked_date IS NULL OR l.revoked_date > ?)
    AND llv.company_id = ?
  ORDER BY l.licence_ref ASC
  `

  const today = timestampForPostgres()

  const { rows } = await db.raw(query, [today, today, today, companyId])

  return rows
}
