'use strict'

/**
 * Fetches the returns due for `/notices/setup/{sessionId}/return-forms` page
 * @module FetchReturnsDueByLicenceRefService
 */

const { db } = require('../../../../db/db.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Fetches the returns due for `/notices/setup/{sessionId}/return-forms` page
 *
 * @param {string} licenceRef - The licence reference to fetch 'due' return logs for
 *
 * @returns {Promise<object[]>}
 */
async function go(licenceRef) {
  const { rows } = await _fetch(licenceRef)

  return rows
}

async function _fetch(licenceRef) {
  const query = `
    SELECT
      rl.due_date AS "dueDate",
      rl.end_date AS "endDate",
      rl.return_id AS "returnId",
      rl.return_reference AS "returnReference",
      rl.returns_frequency AS "returnsFrequency",
      rl.start_date AS "startDate",
      rl.metadata->'purposes'->0->'tertiary'->>'description' AS purpose,
      rl.metadata->'isTwoPartTariff' AS "twoPartTariff",
      rl.metadata->'description' AS "siteDescription",
      rl.metadata->'nald'->>'areaCode' AS "naldAreaCode",
      r.display_name AS "regionName"
    FROM return_logs as rl
        INNER JOIN regions as r
                  ON r.nald_region_id = (rl.metadata->'nald'->>'regionCode')::integer
    WHERE rl.licence_ref = ?
    AND rl.status = 'due'
    AND rl.end_date <= ?
    ORDER BY rl.start_date DESC, rl.return_reference ASC;
  `

  return db.raw(query, [licenceRef, timestampForPostgres()])
}

module.exports = {
  go
}
