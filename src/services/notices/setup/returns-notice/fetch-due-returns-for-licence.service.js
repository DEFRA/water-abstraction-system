/**
 * Fetches the 'due' returns for a licence for the `/notices/setup/{sessionId}/paper-return` page
 * @module FetchDueReturnsForLicenceService
 */

import { db } from 'water-abstraction-engine/db/db.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Fetches the 'due' returns for a licence for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @param {string} licenceRef - The licence reference to fetch 'due' return logs for
 *
 * @returns {Promise<object[]>} The 'due' return logs for the licence
 */
export default async function fetchDueReturnsForLicenceService(licenceRef) {
  const { rows } = await _fetch(licenceRef)

  return rows
}

async function _fetch(licenceRef) {
  const query = `
    SELECT
      rl.id AS "returnLogId",
      rl.due_date AS "dueDate",
      rl.end_date AS "endDate",
      rr.reference AS "returnReference",
      rl.returns_frequency AS "returnsFrequency",
      rl.start_date AS "startDate",
      (
        SELECT p.description
        FROM return_requirement_purposes rrp
        INNER JOIN purposes p
          ON p.id = rrp.purpose_id
        WHERE rrp.return_requirement_id = rr.id
        LIMIT 1
      ) AS purpose,
      rr.two_part_tariff AS "twoPartTariff",
      rr.site_description AS "siteDescription",
      l.regions->>'historicalAreaCode' AS "naldAreaCode",
      r.display_name AS "regionName",
      r.nald_region_id AS "regionCode"
    FROM
      return_logs rl
    INNER JOIN licences l
      ON rl.licence_ref = l.licence_ref
    INNER JOIN regions r
      ON l.region_id = r.id
    INNER JOIN return_requirements rr
      ON rl.return_requirement_id = rr.id
    WHERE
      rl.licence_ref = ?
      AND rl.status = 'due'
      AND rl.end_date <= ?
    ORDER BY
      rl.start_date DESC,
      "returnReference" ASC;
  `

  return db.raw(query, [licenceRef, timestampForPostgres()])
}
