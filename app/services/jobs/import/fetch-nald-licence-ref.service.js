'use strict'

/**
 * Fetches all licence refs with at least one licence version not in draft
 * @module FetchNaldLicenceRefs
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches all licence refs with at least one licence version not in draft
 *
 * @returns {Promise<[String]>} A list licence refs
 */
async function go () {
  const query = `
    SELECT DISTINCT ON (nal."LIC_NO")
        nal."LIC_NO" as licence_ref
    FROM import."NALD_ABS_LIC_VERSIONS" nalv
    INNER JOIN import."NALD_ABS_LICENCES" nal
        ON nal."ID" = nalv."AABL_ID"
        AND nal."FGAC_REGION_CODE" = nalv."FGAC_REGION_CODE"
    WHERE nalv."STATUS" <> 'DRAFT'
  `

  const { rows } = await db.raw(query)

  return rows
}

module.exports = {
  go
}
