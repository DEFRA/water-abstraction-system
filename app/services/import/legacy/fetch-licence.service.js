'use strict'

/**
 * Fetches the licence data from the import.NALD_ABS_LICENCES table for the licence ref
 * @module FetchLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data from the import.NALD_ABS_LICENCES table for the licence ref
 *
 * @param {string} licenceRef - the licence ref to fetch
 *
 * @returns {Promise<ImportLegacyLicenceType>}
 */
async function go (licenceRef) {
  const query = _query()

  const { rows: [row] } = await db.raw(query, [licenceRef])

  return row
}

function _query () {
  return `
    SELECT
      nal."AREP_AREA_CODE" AS historical_area_code,
      nal."AREP_EIUC_CODE" AS environmental_improvement_unit_charge_code,
      nal."AREP_LEAP_CODE" AS local_environment_agency_plan_code,
      nal."AREP_SUC_CODE" AS standard_unit_charge_code,
      (
        CASE nal."EXPIRY_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nal."EXPIRY_DATE", 'DD/MM/YYYY')
        END
      ) AS expiry_date,
      nal."FGAC_REGION_CODE" AS region_code,
      nal."ID" AS id,
      (
        CASE nal."LAPSED_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nal."LAPSED_DATE", 'DD/MM/YYYY')
        END
      ) AS lapsed_date,
      nal."LIC_NO" AS licence_ref,
      (
        CASE nal."ORIG_EFF_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nal."ORIG_EFF_DATE", 'DD/MM/YYYY')
        END
      ) AS original_effective_date,
      (
        CASE nal."REV_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nal."REV_DATE", 'DD/MM/YYYY')
        END
      ) AS revoked_date,
      (
        SELECT
          MIN(to_date(nalv."EFF_ST_DATE", 'DD/MM/YYYY'))
        FROM
          "import"."NALD_ABS_LIC_VERSIONS" nalv
        WHERE
          nalv."FGAC_REGION_CODE" = nal."FGAC_REGION_CODE"
          AND nalv."AABL_ID" = nal."ID"
          AND nalv."STATUS" <> 'DRAFT'
      ) AS earliest_version_start_date
    FROM
      "import"."NALD_ABS_LICENCES" nal
    WHERE
      nal."LIC_NO" = ?;
  `
}

module.exports = {
  go
}

/**
 * Representation of a licence fetched from the NALD data
 *
 * @typedef {object} ImportLegacyLicenceType
 *
 * @property {string} historical_area_code
 * @property {string} environmental_improvement_unit_charge_code
 * @property {string} local_environment_agency_plan_code
 * @property {string} standard_unit_charge_code
 * @property {date} expiry_date
 * @property {number} region_code
 * @property {string} id
 * @property {date} lapsed_date
 * @property {date} original_effective_date
 * @property {date} revoked_date
 * @property {date} earliest_version_start_date
 */