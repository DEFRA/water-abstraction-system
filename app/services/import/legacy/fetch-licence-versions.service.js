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
      (concat_ws(':', nalv."FGAC_REGION_CODE", nalv."AABL_ID", nalv."ISSUE_NO", nalv."INCR_NO")) AS external_id,
      (nalv."INCR_NO")::INTEGER AS increment_number,
      (nalv."ISSUE_NO")::INTEGER AS issue_no,
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
 * @property {Date} effective_end_date
 * @property {Date} effective_start_date
 * @property {string} external_id
 * @property {number} increment_number
 * @property {number} issue_no
 * @property {string} status
 */
