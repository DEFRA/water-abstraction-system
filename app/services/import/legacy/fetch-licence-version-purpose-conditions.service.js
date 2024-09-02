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
      nalc."ACIN_CODE" AS code,
      nalc."ACIN_SUBCODE" AS subcode,
      lvpct.id as licence_version_purpose_condition_type_id,
      (
        CASE nalc."PARAM1"
          WHEN 'null' THEN NULL
          ELSE nalc."PARAM1"
        END
      ) AS param_1,
      (
        CASE nalc."PARAM2"
          WHEN 'null' THEN NULL
          ELSE nalc."PARAM2"
        END
      ) AS param_2,
      (
        CASE nalc."TEXT"
          WHEN 'null' THEN NULL
          ELSE nalc."TEXT"
        END
      ) AS notes,
      (concat_ws(':', nalc."FGAC_REGION_CODE", nalc."AABP_ID")) AS purpose_external_id,
      (concat_ws(':', nalc."ID", nalc."FGAC_REGION_CODE", nalc."AABP_ID")) AS external_id
    FROM
      "import"."NALD_LIC_CONDITIONS" nalc
    INNER JOIN
      "import"."NALD_ABS_LIC_PURPOSES" nalp
      ON concat_ws(':', nalp."FGAC_REGION_CODE", nalp."ID") = concat_ws(':', nalc."FGAC_REGION_CODE", nalc."AABP_ID")
    INNER JOIN
      "import"."NALD_ABS_LIC_VERSIONS" nalv
      ON concat_ws(':', nalv."FGAC_REGION_CODE", nalv."AABL_ID", nalv."ISSUE_NO", nalv."INCR_NO") = concat_ws(':', nalp."FGAC_REGION_CODE", nalp."AABV_AABL_ID", nalp."AABV_ISSUE_NO", nalp."AABV_INCR_NO")
    LEFT JOIN
      public.licence_version_purpose_condition_types lvpct
      ON nalc."ACIN_CODE" = LVPCT.code
      AND nalc."ACIN_SUBCODE" = LVPCT.subcode
    WHERE
      nalp."FGAC_REGION_CODE" = ?
      AND nalp."AABV_AABL_ID" = ?
      AND nalv."STATUS" <> 'DRAFT';
`
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyLicenceVersionPurposeConditionType
 *
 * @property {string} code - The code associated with the condition, derived from "ACIN_CODE".
 * @property {string} subcode - The subcode associated with the condition, derived from "ACIN_SUBCODE".
 * @property {string|null} param1 - The first parameter, which may be null, from "PARAM1".
 * @property {string|null} param2 - The second parameter, which may be null, from "PARAM2".
 * @property {string|null} notes - Additional notes, which may be null, from "TEXT".
 * @property {string} purpose_external_id - A concatenated string representing the purpose external ID,
 * combining "FGAC_REGION_CODE" and "AABP_ID". This is used to match with a licence version purpose
 * @property {string} external_id - A concatenated string representing the external ID, combining "ID",
 * @property {string} licence_version_purpose_condition_type_id - the condition type id from the reference data
 */
