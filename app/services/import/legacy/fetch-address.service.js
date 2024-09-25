'use strict'

/**
 * Fetches the addresses data from the import.NALD_ADDRESSESS table for the licence ref
 * @module FetchAddressesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the addresses data from the import.NALD_ADDRESSESS table for the licence ref
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyAddressType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId, licenceId])

  return rows
}

function _query () {
  return `
    SELECT DISTINCT ON (external_id)
      (
        CASE na."ADDR_LINE1"
          WHEN 'null' THEN NULL
          ELSE na."ADDR_LINE1"
          END
        ) AS address1,
      (
        CASE na."ADDR_LINE2"
          WHEN 'null' THEN NULL
          ELSE na."ADDR_LINE2"
          END
        ) AS address2,
      (
        CASE na."ADDR_LINE3"
          WHEN 'null' THEN NULL
          ELSE na."ADDR_LINE3"
          END
        ) AS address3,
      (
        CASE na."ADDR_LINE4"
          WHEN 'null' THEN NULL
          ELSE na."ADDR_LINE4"
          END
        ) AS address4,
      (
        CASE na."TOWN"
          WHEN 'null' THEN NULL
          ELSE na."TOWN"
          END
        ) AS town,
      (
        CASE na."COUNTY"
          WHEN 'null' THEN NULL
          ELSE na."COUNTY"
          END
        ) AS county,
      (
        CASE na."POSTCODE"
          WHEN 'null' THEN NULL
          ELSE na."POSTCODE"
          END
        ) AS postcode,
      (
        CASE na."COUNTRY"
          WHEN 'null' THEN NULL
          ELSE na."COUNTRY"
          END
        ) AS country,
      (concat_ws(':', na."FGAC_REGION_CODE", na."ID")) AS external_id,
      (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS company_external_id
    FROM
      "import"."NALD_ADDRESSES" na
        LEFT JOIN
      "import"."NALD_ABS_LIC_VERSIONS" nalv
      ON nalv."ACON_AADD_ID" = na."ID"
        AND nalv."FGAC_REGION_CODE" = na."FGAC_REGION_CODE"
        LEFT JOIN
      "import"."NALD_LIC_ROLES" nlr
      ON nlr."ACON_AADD_ID" = na."ID"
        AND nlr."FGAC_REGION_CODE" = na."FGAC_REGION_CODE"
      LEFT JOIN import."NALD_PARTIES" np
        ON np."FGAC_REGION_CODE" = na."FGAC_REGION_CODE"
        AND (np."ID" = nalv."ACON_APAR_ID") OR ( np."ID" = nlr."ACON_APAR_ID")
    WHERE
      na."FGAC_REGION_CODE" = ?
      AND (
      (nalv."AABL_ID" = ? AND nalv."ACON_AADD_ID" IS NOT NULL)
        OR
      (nlr."AABL_ID" = ? AND nlr."ACON_AADD_ID" IS NOT NULL)
      );
  `
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyAddressType
 *
 * @property {string} address1 - First address line (ADDR_LINE1)
 * @property {string} [address2] - Second address line (ADDR_LINE2), optional
 * @property {string} [address3] - Third address line (ADDR_LINE3), optional
 * @property {string} [address4] - Fourth address line (ADDR_LINE4), optional
 * @property {string} town - The town (TOWN)
 * @property {string} county - The county (COUNTY)
 * @property {string} postcode - The postcode (POSTCODE)
 * @property {string} country - The country (COUNTRY)
 * @property {string} external_id - The external identifier, combination of FGAC_REGION_CODE and ID
 */
