'use strict'

/**
 * Fetches the licence version purposes data from the import.NALD_ABS_LIC_PURPOSES table for the licence being imported
 * @module FetchLicenceVersionPurposesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence version purposes data from the import.NALD_ABS_LIC_PURPOSES table for the licence being imported
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceVersionPurposeType[]>}
 */
async function go(regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query() {
  return `
    SELECT
      (nalp."PERIOD_END_DAY")::INTEGER AS abstraction_period_end_day,
      (nalp."PERIOD_END_MONTH")::INTEGER AS abstraction_period_end_month,
      (nalp."PERIOD_ST_DAY")::INTEGER AS abstraction_period_start_day,
      (nalp."PERIOD_ST_MONTH")::INTEGER AS abstraction_period_start_month,
      (
        CASE nalp."ANNUAL_QTY"
          WHEN 'null' THEN NULL
          ELSE (nalp."ANNUAL_QTY")::NUMERIC
        END
      ) AS annual_quantity,
      (
        CASE nalp."DAILY_QTY"
          WHEN 'null' THEN NULL
          ELSE (nalp."DAILY_QTY")::NUMERIC
        END
      ) AS daily_quantity,
      (concat_ws(':', nalp."FGAC_REGION_CODE", nalp."ID")) AS external_id,
      (
        CASE nalp."HOURLY_QTY"
          WHEN 'null' THEN NULL
          ELSE (nalp."HOURLY_QTY")::NUMERIC
        END
      ) AS hourly_quantity,
      (
        CASE nalp."INST_QTY"
          WHEN 'null' THEN NULL
          ELSE (nalp."INST_QTY")::NUMERIC
        END
      ) AS instant_quantity,
      (
        CASE nalp."NOTES"
          WHEN 'null' THEN NULL
          ELSE nalp."NOTES"
        END
      ) AS notes,
      pp.id AS primary_purpose_id,
      p.id AS purpose_id,
      sp.id AS secondary_purpose_id,
      (
        CASE nalp."TIMELTD_END_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nalp."TIMELTD_END_DATE", 'DD/MM/YYYY')
        END
      )  AS time_limited_end_date,
      (
        CASE nalp."TIMELTD_ST_DATE"
          WHEN 'null' THEN NULL
          ELSE to_date(nalp."TIMELTD_ST_DATE", 'DD/MM/YYYY')
        END
      )  AS time_limited_start_date,
      (concat_ws(':', nalv."FGAC_REGION_CODE", nalv."AABL_ID", nalv."ISSUE_NO", nalv."INCR_NO")) AS version_external_id
    FROM
      "import"."NALD_ABS_LIC_PURPOSES" nalp
    INNER JOIN
      "import"."NALD_ABS_LIC_VERSIONS" nalv ON
      concat_ws(':', nalv."FGAC_REGION_CODE", nalv."AABL_ID", nalv."ISSUE_NO", nalv."INCR_NO") = concat_ws(':', nalp."FGAC_REGION_CODE", nalp."AABV_AABL_ID", nalp."AABV_ISSUE_NO", nalp."AABV_INCR_NO")
    LEFT JOIN
      public.purposes p ON p.legacy_id = nalp."APUR_APUS_CODE"
    LEFT JOIN
      public.primary_purposes pp ON pp.legacy_id = nalp."APUR_APPR_CODE"
    LEFT JOIN
      public.secondary_purposes sp ON sp.legacy_id = nalp."APUR_APSE_CODE"
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
 * @typedef {object} ImportLegacyLicenceVersionPurposeType
 *
 * @property {number} abstraction_period_end_day
 * @property {number} abstraction_period_end_month
 * @property {number} abstraction_period_start_day
 * @property {number} abstraction_period_start_month
 * @property {number} annual_quantity
 * @property {number} daily_quantity
 * @property {number} hourly_quantity
 * @property {number} instant_quantity
 * @property {string} notes
 * @property {string} primary_purpose_id
 * @property {string} purpose_id
 * @property {string} secondary_purpose_id
 * @property {Date} time_limited_end_date
 * @property {Date} time_limited_start_date
 * @property {string} version_external_id
 */
