'use strict'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
 * @module FetchContactsService
 */

const { db } = require('../../../../db/db.js')

const licenceHolderName = 'licenceHolder'

/**
 * Fetches the company data from the import.NALD_PARTIES table for the licence ref
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
    to_date(nalv."EFF_ST_DATE", 'DD/MM/YYYY') as start_date,
    (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS external_id,
    (
      CASE np."SALUTATION"
        WHEN 'null' THEN NULL
        ELSE np."SALUTATION"
      END
    ) AS salutation,
    (
      CASE np."INITIALS"
        WHEN 'null' THEN NULL
        ELSE np."INITIALS"
      END
    ) AS initials,
    (
      CASE np."FORENAME"
        WHEN 'null' THEN NULL
        ELSE np."FORENAME"
      END
    ) AS first_name,
    (
      CASE np."NAME"
        WHEN 'null' THEN NULL
        ELSE np."NAME"
      END
    ) AS last_name,
    lr.id as licence_role_id
  FROM import."NALD_PARTIES" np
    LEFT JOIN import."NALD_ABS_LIC_VERSIONS" nalv
        ON nalv."ACON_APAR_ID" = np."ID"
        AND nalv."FGAC_REGION_CODE" = np."FGAC_REGION_CODE"
    INNER JOIN public.licence_roles lr
        ON lr.name = '${licenceHolderName}'
  WHERE np."APAR_TYPE" != 'ORG'
    AND nalv."FGAC_REGION_CODE" = ?
    AND nalv."AABL_ID" = ?
  ORDER BY  np."ID", TO_DATE(nalv."EFF_ST_DATE", 'DD/MM/YYYY') ASC;
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
 * @property {Date} start_date - the earliest start date for the licence versions
 * @property {uuid} licence_role_id - the licence role reference data id from WLRS
 *
 */
