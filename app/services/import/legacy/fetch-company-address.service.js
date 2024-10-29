'use strict'

/**
 * Fetches the NALD data for a company address using the licence ref
 * @module FetchCompanyAddressesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the NALD data for a company address using the licence ref
 *
 * A Company Address is a WRLS concept. It is used to link an address to a company, with a role.
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyCompanyAddressType[]>}
 */
async function go (regionCode, licenceId) {
  const licenceHolderData = await _getLicenceHolder(regionCode, licenceId)
  const returnsToData = await _getReturnsTo(regionCode, licenceId)

  return [...licenceHolderData, ...returnsToData]
}

/**
 * Fetches the NALD data for a licence version to create a company address for the licence holder
 *
 * @private
 */
async function _getLicenceHolder (regionCode, licenceId) {
  const query = `
    WITH end_date_cte AS (
      SELECT
        "ACON_AADD_ID",
        CASE
          WHEN COUNT("EFF_END_DATE") FILTER (WHERE "EFF_END_DATE" = 'null') > 0 THEN NULL
          ELSE MAX(TO_DATE(NULLIF("EFF_END_DATE", 'null'), 'DD/MM/YYYY'))
          END AS end_date
      FROM import."NALD_ABS_LIC_VERSIONS"
      WHERE "FGAC_REGION_CODE" = ?
        AND "AABL_ID" = ?
      GROUP BY "ACON_AADD_ID"
    )
    SELECT DISTINCT ON (nalv."ACON_AADD_ID")
      ed.end_date,
      TO_DATE(NULLIF(nalv."EFF_ST_DATE", 'null'), 'DD/MM/YYYY') AS start_date,
      TO_DATE(NULLIF(nal."REV_DATE", 'null'), 'DD/MM/YYYY') AS revoked_date,
      TO_DATE(NULLIF(nal."EXPIRY_DATE", 'null'), 'DD/MM/YYYY') AS expired_date,
      TO_DATE(NULLIF(nal."LAPSED_DATE", 'null'), 'DD/MM/YYYY') AS lapsed_date,
      (concat_ws(':', nalv."FGAC_REGION_CODE", nalv."ACON_AADD_ID")) AS external_id,
      (concat_ws(':', nalv."FGAC_REGION_CODE", nalv."ACON_APAR_ID")) AS company_external_id,
      nalv."ACON_APAR_ID" AS party_id,
      nalv."ACON_AADD_ID" AS address_id,
      lr.id as licence_role_id,
      lr.name as licence_role_name
    FROM import."NALD_ABS_LIC_VERSIONS" AS nalv
      INNER JOIN public.licence_roles AS lr
        ON lr.name = 'licenceHolder'
      INNER JOIN import."NALD_ABS_LICENCES" AS nal
        ON nal."ID" = nalv."AABL_ID"
          AND nal."FGAC_REGION_CODE" = nalv."FGAC_REGION_CODE"
      LEFT JOIN end_date_cte AS ed
        ON ed."ACON_AADD_ID" = nalv."ACON_AADD_ID"
    WHERE nalv."FGAC_REGION_CODE" = ?
      AND nalv."AABL_ID" = ?
      AND nalv."ACON_AADD_ID" IS NOT NULL;
  `

  const { rows } = await db.raw(query, [regionCode, licenceId, regionCode, licenceId])

  return rows
}

/**
 * Fetches the NALD data for a licence role to create a company address for the returns to
 *
 * @private
 */
async function _getReturnsTo (regionCode, licenceId) {
  const query = `
    SELECT
      CASE
        WHEN COUNT(nlr."EFF_END_DATE") FILTER (WHERE nlr."EFF_END_DATE" = 'null') > 0 THEN NULL
        ELSE MAX(TO_DATE(NULLIF(nlr."EFF_END_DATE", 'null'), 'DD/MM/YYYY'))
        END AS end_date,
      CASE
        WHEN COUNT(nlr."EFF_ST_DATE") FILTER (WHERE nlr."EFF_ST_DATE" = 'null') > 0 THEN NULL
        ELSE MIN(TO_DATE(NULLIF(nlr."EFF_ST_DATE", 'null'), 'DD/MM/YYYY'))
        END AS start_date,
      nlr."ACON_AADD_ID" as address_id,
      nlr."ACON_APAR_ID" as party_id,
      (concat_ws(':', nlr."FGAC_REGION_CODE", nlr."ACON_AADD_ID")) AS external_id,
      (concat_ws(':', nlr."FGAC_REGION_CODE", nlr."ACON_APAR_ID")) AS company_external_id,
      lr.id as licence_role_id,
      lr.name as licence_role_name
    FROM import."NALD_LIC_ROLES" nlr
      INNER JOIN import."NALD_PARTIES" np
        ON np."FGAC_REGION_CODE" = nlr."FGAC_REGION_CODE"
        AND np."ID" = nlr."ACON_APAR_ID"
      INNER JOIN public.licence_roles AS lr
        ON lr.name = 'returnsTo'
    WHERE nlr."FGAC_REGION_CODE" = ?
      AND nlr."AABL_ID" = ?
      AND nlr."ACON_AADD_ID" IS NOT NULL
      AND nlr."ALRT_CODE" = 'RT'
    GROUP BY address_id, licence_role_id, party_id,external_id, company_external_id, licence_role_name;
`

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyCompanyAddressType
 *
 * @property {string} external_id - The address id
 * @property {string} company_external_id - The company id
 * @property {string} licence_role_id - The licence role id from the reference data
 * @property {string} start_date - The licence version with the earliest start date
 * @property {string} end_date - The licence version latest end date, unless null then always null
 * @property {string} revoked_date - The licence revoked date
 * @property {string} expired_date - The licence expired date
 * @property {string} lapsed_date - The licence lapsed licence date
 *
 */
