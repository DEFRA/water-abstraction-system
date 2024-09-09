'use strict'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
 * @module FetchContactsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data from the import.NALD_PARTIES table for the licence ref
 *
 * When a company has at least one licence version and the type of contact is not an organisation.
 * Then it will have a contact.
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyContactType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

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
      )  AS first_name,
    (
      CASE np."NAME"
        WHEN 'null' THEN NULL
        ELSE np."NAME"
        END
      )  AS last_name
  FROM import."NALD_PARTIES" np
    LEFT JOIN import."NALD_ABS_LIC_VERSIONS" nalv
      ON nalv."ACON_APAR_ID" = np."ID"
      AND nalv."FGAC_REGION_CODE" = np."FGAC_REGION_CODE"
  WHERE np."APAR_TYPE" != 'ORG'
    AND nalv."FGAC_REGION_CODE" = ?
    AND nalv."AABL_ID" = ?
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
