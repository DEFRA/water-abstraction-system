'use strict'

/**
 * Fetches the licence document roles data from the import data
 * @module FetchLicenceDocumentRolesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence document roles data from the import data
 *
 * This will come from the licence versions and the licence roles.
 *
 * We are only interest in the returnsTo licence role from the import.NALD_LIC_ROLES
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceDocumentRoleType[]>}
 */
async function go (regionCode, licenceId) {
  const returnsToData = await _getReturnsTo(regionCode, licenceId)
  const licenceHolderData = await _getLicenceHolder(regionCode, licenceId)

  return [...returnsToData, ...licenceHolderData]
}

async function _getReturnsTo (regionCode, licenceId) {
  const query = `
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
          ELSE concat_ws(':', nlr."FGAC_REGION_CODE", nlr."ACON_APAR_ID")
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
      AND nlr."AABL_ID" = ?;`

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

async function _getLicenceHolder (regionCode, licenceId) {
  const query = `
    SELECT
      lr.id as licence_role_id,
      concat_ws(':', nalv."FGAC_REGION_CODE", nalv."ACON_AADD_ID") as address_id,
      concat_ws(':', nalv."FGAC_REGION_CODE", nalv."ACON_APAR_ID") as company_id,
      GREATEST(
        TO_DATE(NULLIF(nalv."EFF_ST_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nal."ORIG_EFF_DATE", 'null'), 'DD/MM/YYYY')
      ) as start_date,
      LEAST(
        TO_DATE(NULLIF(nal."LAPSED_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nal."REV_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nal."EXPIRY_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nalv."EFF_END_DATE", 'null'), 'DD/MM/YYYY')
      ) as end_date,
      (
        CASE
          WHEN np."APAR_TYPE" = 'ORG'
            THEN NULL
          ELSE concat_ws(':', nalv."FGAC_REGION_CODE", nalv."ACON_APAR_ID")
          END
        ) as contact_id
    FROM import."NALD_ABS_LIC_VERSIONS" nalv
      INNER JOIN import."NALD_ABS_LICENCES" nal
        ON nal."FGAC_REGION_CODE" = nalv."FGAC_REGION_CODE"
        AND nal."ID" = nalv."AABL_ID"
      INNER JOIN import."NALD_PARTIES" np
        ON np."ID" = nalv."ACON_APAR_ID"
        AND np."FGAC_REGION_CODE" = nalv."FGAC_REGION_CODE"
      INNER JOIN public.licence_roles lr
        ON lr.name = 'licenceHolder'
    WHERE nalv."FGAC_REGION_CODE"=?
      AND nalv."AABL_ID"=?
      AND nalv."STATUS"<>'DRAFT'`

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
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
