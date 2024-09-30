'use strict'

/**
 * Fetches the addresses data from the import.NALD_ADDRESSESS table for the licence ref
 * @module FetchCompanyAddressesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the addresses data from the import.NALD_ADDRESSESS table for the licence ref
 *
 * A company address is the link between a company and an address
 *
 * This requires the company id, licence role id and address id
 *
 * The licence holder is created from the import.NALD_ABS_LIC_VERSIONS table
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyCompanyAddressType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
    WITH end_date_cte AS (
      SELECT
        "ACON_AADD_ID",
        CASE
          WHEN COUNT("EFF_END_DATE") FILTER (WHERE "EFF_END_DATE" = 'null') > 0 THEN NULL
          ELSE MAX(TO_DATE(NULLIF("EFF_END_DATE", 'null'), 'DD/MM/YYYY'))
          END AS end_date
      FROM import."NALD_ABS_LIC_VERSIONS"
      WHERE "AABL_ID" = '10000003'
        AND "FGAC_REGION_CODE" = '3'
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
 * @property {string} start_date - The licence version earliest start date
 * @property {string} end_date - The licence version latest end date, unless null then always null
 * @property {string} revoked_date - The licence revoked date
 * @property {string} expired_date - The licence expired date
 * @property {string} lapsed_date - The licence lapsed licence date
 *
 */
