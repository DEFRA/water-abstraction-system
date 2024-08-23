'use strict'

/**
 * Fetches the licence versions data from the import.NALD_ABS_LIC_VERSIONS table for the licence being imported
 * @module FetchLicenceVersionsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence versions data from the import.NALD_ABS_LIC_VERSIONS table for the licence being imported
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceVersionType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
    SELECT
      (
        CASE nalv."EFF_END_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nalv."EFF_END_DATE", 'DD/MM/YYYY')
        END
      )  AS effective_end_date,
      (
        CASE nalv."EFF_ST_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nalv."EFF_ST_DATE", 'DD/MM/YYYY')
        END
      )  AS effective_start_date,
      (nalv."AABL_ID") AS id,
      (nalv."INCR_NO")::INTEGER AS increment_number,
      (nalv."ISSUE_NO")::INTEGER AS issue_no,
      (nalv."FGAC_REGION_CODE") AS region_code,
      nalv."STATUS" AS status
    FROM
      "import"."NALD_ABS_LIC_VERSIONS" nalv
    WHERE
      nalv."FGAC_REGION_CODE" = ?
      AND nalv."AABL_ID" = ?
      AND nalv."STATUS" <> 'DRAFT';
  `
}

module.exports = {
  go
}

/**
 * Representation of a licence version fetched from the NALD data
 * @typedef {object} ImportLegacyLicenceVersionType
 *
 * @property {date} effective_end_date
 * @property {date} effective_start_date
 * @property {string} id
 * @property {number} increment_number
 * @property {number} issue_no
 * @property {string} region_code
 * @property {string} status
 */
