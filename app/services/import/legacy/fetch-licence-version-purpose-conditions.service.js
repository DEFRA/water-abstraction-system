'use strict'

/**
 * Fetches the licence version purpose conditions data from the import.NALD_LIC_CONDITIONS table for the licence
 * being imported
 * @module FetchLicenceVersionPurposeConditionsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence version purpose conditions data from the import.NALD_LIC_CONDITIONS table for the licence
 * being imported
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceVersionPurposeConditionsType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
    SELECT
      NALC."ACIN_CODE"                                                     AS CODE,
      NALC."ACIN_SUBCODE"                                                  AS SUBCODE,
      (
       CASE NALC."PARAM1"
         WHEN 'null' THEN NULL
         ELSE NALC."PARAM1"
         END
       )                                                                  AS PARAM1,
      (
       CASE NALC."PARAM2"
         WHEN 'null' THEN NULL
         ELSE NALC."PARAM2"
         END
       )                                                                  AS PARAM2,
      (CASE NALC."TEXT"
        WHEN 'null' THEN NULL
        ELSE NALC."TEXT"
       END
       )                                                                  AS NOTES,
      (CONCAT_WS(':', NALC."FGAC_REGION_CODE", NALC."AABP_ID"))            AS PURPOSE_EXTERNAL_ID,
      (CONCAT_WS(':', NALC."ID", NALC."FGAC_REGION_CODE", NALC."AABP_ID")) AS EXTERNAL_ID
    FROM "import"."NALD_LIC_CONDITIONS" NALC
           INNER JOIN "import"."NALD_ABS_LIC_PURPOSES" NALP ON
      CONCAT_WS(':', NALP."FGAC_REGION_CODE", NALP."ID") = CONCAT_WS(':', NALC."FGAC_REGION_CODE", NALC."AABP_ID")
           INNER JOIN
         "import"."NALD_ABS_LIC_VERSIONS" NALV ON
           CONCAT_WS(':', NALV."FGAC_REGION_CODE", NALV."AABL_ID", NALV."ISSUE_NO", NALV."INCR_NO") =
           CONCAT_WS(':', NALP."FGAC_REGION_CODE", NALP."AABV_AABL_ID", NALP."AABV_ISSUE_NO", NALP."AABV_INCR_NO")
    WHERE NALP."FGAC_REGION_CODE" = ?
      AND NALP."AABV_AABL_ID" = ?
      AND NALV."STATUS" <> 'DRAFT';
	`
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyLicenceVersionPurposeConditionsType
 *
 * @property {string} code - The code associated with the condition, derived from "ACIN_CODE".
 * @property {string} subcode - The subcode associated with the condition, derived from "ACIN_SUBCODE".
 * @property {string|null} param1 - The first parameter, which may be null, from "PARAM1".
 * @property {string|null} param2 - The second parameter, which may be null, from "PARAM2".
 * @property {string|null} notes - Additional notes, which may be null, from "TEXT".
 * @property {string} purpose_external_id - A concatenated string representing the purpose external ID,
 * combining "FGAC_REGION_CODE" and "AABP_ID". This is used to match with a licence version purpose
 * @property {string} external_id - A concatenated string representing the external ID, combining "ID",
 * "FGAC_REGION_CODE", and "AABP_ID".
 */
