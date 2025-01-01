'use strict'

/**
 * Fetches all licences that are in NALD and WRLS
 * @module FetchLicences
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches all licences that are in NALD and WRLS
 *
 * A licence is valid if at least one licence version is not in draft
 *
 * @returns {Promise<object[]>} - An array of licences
 */
async function go() {
  const query = `
    SELECT DISTINCT ON (nal."LIC_NO")
      l.id AS id,
      TO_DATE(NULLIF(nal."EXPIRY_DATE", 'null'), 'DD/MM/YYYY') AS nald_expired_date,
      TO_DATE(NULLIF(nal."LAPSED_DATE", 'null'), 'DD/MM/YYYY') AS nald_lapsed_date,
      TO_DATE(NULLIF(nal."REV_DATE", 'null'), 'DD/MM/YYYY') AS nald_revoked_date,
      l.expired_date AS wrls_expired_date,
      l.lapsed_date AS wrls_lapsed_date,
      l.revoked_date AS wrls_revoked_date
    FROM "import"."NALD_ABS_LIC_VERSIONS" nalv
      INNER JOIN "import"."NALD_ABS_LICENCES" nal
        ON nal."ID" = nalv."AABL_ID"
        AND nal."FGAC_REGION_CODE" = nalv."FGAC_REGION_CODE"
      INNER JOIN
        public.licences l ON l.licence_ref = nal."LIC_NO"
    WHERE nalv."STATUS" <> 'DRAFT'
  `

  const { rows } = await db.raw(query)

  return rows
}

module.exports = {
  go
}
