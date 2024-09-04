'use strict'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
 * @module FetchCompanyService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data from the import.NALD_PARTIES table for the licence ref
 *
 * After this point parties will be referred to as companies
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyCompaniesType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
  SELECT
    (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS external_id,
    (
      CASE np."SALUTATION"
        WHEN 'null' THEN NULL
        ELSE np."SALUTATION"
        END
      )  AS salutation,
    (
      CASE np."FORENAME"
        WHEN 'null' THEN NULL
        ELSE np."FORENAME"
        END
      )  AS firstName,
    (
      CASE np."NAME"
        WHEN 'null' THEN NULL
        ELSE np."NAME"
        END
      )  AS lastName,
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
      )) AS name,
    nlr."ACON_APAR_ID" as party_id,
    nlr."ACON_AADD_ID" as address_id
  FROM import."NALD_LIC_ROLES" nlr
    INNER JOIN import."NALD_PARTIES" np
      ON np."ID" = nlr."ACON_APAR_ID"
      AND np."FGAC_REGION_CODE" = nlr."FGAC_REGION_CODE"
  WHERE nlr."FGAC_REGION_CODE" = ?
  AND nlr."AABL_ID" = ?
  `
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyCompaniesType
 *
 * @property {string|null} salutation - The salutation of the person, or null if not applicable.
 * @property {string|null} firstName - The first name of the person, or null if not applicable.
 * @property {string|null} lastName - The last name of the person, or null if not applicable.
 * @property {string} type - Indicates whether the entry is a 'person' or an 'organisation'.
 * @property {string|null} name - The full name, concatenated from salutation, forename/initials, and name.
 * @property {string} external_id - The external ID, formatted as 'FGAC_REGION_CODE:ID'.
 * @property {string} party_id - The ID from the "ACON_APAR_ID" column.
 * @property {string} address_id - The ID from the "ACON_AADD_ID" column.
 *
 */
