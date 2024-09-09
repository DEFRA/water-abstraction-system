'use strict'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
 * @module FetchContactsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data from the import.NALD_PARTIES table for the licence ref
 *
 * From this point parties will be referred to as companies and a party will be known as a company
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyContactType[]>}
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
      CASE np."SALUTATION"
        WHEN 'null' THEN NULL
        ELSE np."SALUTATION"
        END
      )  AS salutation,
    (
      CASE np."INITIALS"
        WHEN 'null' THEN NULL
        ELSE np."INITIALS"
        END
      )  AS initials,
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
      )  AS lastName
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
 * @typedef {object} ImportLegacyContactType
 *
 * @property {string|null} salutation - The salutation of the person, or null if not applicable.
 * @property {string|null} initials - The initials of the person, or null if not applicable.
 * @property {string|null} firstName - The first name of the person, or null if not applicable.
 * @property {string|null} lastName - The last name of the person, or null if not applicable.
 * @property {string} external_id - The external ID, formatted as 'FGAC_REGION_CODE:ID'.
 *
 */
