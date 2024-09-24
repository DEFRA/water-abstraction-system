'use strict'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
 * @module FetchCompanyService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the party data from the import.NALD_PARTIES table for the licence ref
 *
 * From this point parties will be referred to as companies and a party will be known as a company
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyCompanyType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId, regionCode, licenceId])

  return rows
}

function _query () {
  return `
  SELECT DISTINCT ON (np."ID")
    (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS external_id,
    (
      CASE np."APAR_TYPE"
        WHEN 'PER' THEN 'person'
        ELSE 'organisation'
        END
      )  AS type,
    TRIM(BOTH ' ' FROM (
      CASE
        -- If FORENAME or INITIALS are NULL, use NAME directly
        WHEN np."FORENAME" = 'null' AND np."INITIALS" = 'null' THEN np."NAME"
        ELSE CONCAT_WS(' ',
          CASE
            WHEN np."SALUTATION" = 'null' THEN NULL
            ELSE np."SALUTATION"
          END,
          CASE
            WHEN np."FORENAME" = 'null' THEN np."INITIALS"
            ELSE np."FORENAME"
          END,
          CASE
            WHEN np."NAME" = 'null' THEN NULL
            ELSE np."NAME"
          END
          )
        END
      )) AS name
  FROM import."NALD_PARTIES" np
    LEFT JOIN import."NALD_ABS_LIC_VERSIONS" nalv
      ON nalv."ACON_APAR_ID" = np."ID"
      AND nalv."FGAC_REGION_CODE" = np."FGAC_REGION_CODE"
    LEFT JOIN import."NALD_LIC_ROLES" nlr
      ON nlr."ACON_APAR_ID" = np."ID"
      AND nlr."FGAC_REGION_CODE" = np."FGAC_REGION_CODE"
  WHERE
    (nalv."FGAC_REGION_CODE" = ? AND nalv."AABL_ID" = ?)
  OR
    (nlr."FGAC_REGION_CODE" = ? AND nlr."AABL_ID" = ?)
  `
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyCompanyType
 *
 * @property {string} type - Indicates whether the entry is a 'person' or an 'organisation'.
 * @property {string|null} name - The full name, concatenated from salutation, forename/initials, and name.
 * @property {string} external_id - The external ID, formatted as 'FGAC_REGION_CODE:ID'.
 *
 */
