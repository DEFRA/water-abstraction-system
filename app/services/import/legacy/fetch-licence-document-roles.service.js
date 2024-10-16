'use strict'

/**
 * Fetches the licence document roles data from the import.NALD_ABS_LICENCES table for the licence being imported
 * @module FetchLicenceDocumentRolesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence document roles data from the import.NALD_ABS_LICENCES table for the licence being imported
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceDocumentRoleType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
    SELECT
      lr.id as licence_role_id,
      TO_DATE(nlr."EFF_ST_DATE", 'DD/MM/YYY' ) as start_date,
      TO_DATE(NULLIF(nlr."EFF_END_DATE", 'null'), 'DD/MM/YYY' )  as end_date,
      concat_ws(':', nlr."FGAC_REGION_CODE", nlr."ACON_AADD_ID") as address_id,
      concat_ws(':', nlr."FGAC_REGION_CODE", nlr."ACON_APAR_ID") as company_id,
      (
        CASE
          WHEN np."APAR_TYPE" = 'ORG'
            THEN NULL
          ELSE concat_ws(':', nlr."FGAC_REGION_CODE", np."ID")
          END
        ) as contact_id
    FROM import."NALD_LIC_ROLES" nlr
      INNER JOIN public.licence_roles lr
        ON lr.name = 'returnsTo'
      Inner JOIN import."NALD_PARTIES" np
        ON np."FGAC_REGION_CODE" = nlr."FGAC_REGION_CODE"
        AND np."ID" = nlr."ACON_APAR_ID"
    WHERE
      nlr."ALRT_CODE" = 'RT'
      AND nlr."FGAC_REGION_CODE" = ?
      AND nlr."AABL_ID" = ?;
  `
}

module.exports = {
  go
}

/**
 * Representation of a licence document fetched from the NALD data
 * @typedef {object} ImportLegacyLicenceDocumentRoleType
 *
 * @property { guid } licence_role_id - The licence role id from WRLS
 * @property { Date } start_date - EFF_ST_DATE
 * @property { Date } end_date - EFF_END_DATE
 * @property { string } address_id - used to link to the address (external id)
 * @property { string } company_id - used to link to the company (external id)
 * @property { string } contact_id - a person should have a contact id
 */
