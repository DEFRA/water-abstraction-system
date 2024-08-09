'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceVersionsService
 */
const { db } = require('../../../../db/db.js')

/**
 * Gets the legacy licence versions
 *
 * Returns the legacy licence version purposes.
 *
 * @param { object } licenceData - The data related to the licence.
 * @returns {Promise<Array<{
 *   EFF_END_DATE: string,
 *   EFF_ST_DATE: string,
 *   INCR_NO: string,
 *   ISSUE_NO: string,
 *   STATUS: 'SUPER' | 'CURR',
 *   FGAC_REGION_CODE: string,
 *   AABL_ID: string,
 *   purposes: {
 *     PERIOD_END_DAY: string,
 *     PERIOD_END_MONTH: string,
 *     PERIOD_ST_DAY: string,
 *     PERIOD_ST_MONTH: string,
 *     ANNUAL_QTY: string,
 *     DAILY_QTY: string,
 *     FGAC_REGION_CODE: string,
 *     ID: string,
 *     HOURLY_QTY: string,
 *     INST_QTY: string,
 *     NOTES: string,
 *     APUR_APPR_CODE: string,
 *     APUR_APSE_CODE: string,
 *     APUR_APUS_CODE: string,
 *     TIMELTD_END_DATE: string,
 *     TIMELTD_ST_DATE: string
 *   }
 * }>>}
 */
async function go (licenceData) {
  const { ID: licenceId, FGAC_REGION_CODE: regionCode } = licenceData

  return _getLicenceVersions(licenceId, regionCode)
}

async function _getLicenceVersions (licenceId, regionCode) {
  const query = `
      SELECT versions."EFF_END_DATE",
             versions."EFF_ST_DATE",
             versions."INCR_NO",
             versions."ISSUE_NO",
             versions."STATUS",
             versions."FGAC_REGION_CODE",
             versions."AABL_ID",
             (SELECT json_agg(json_build_object(
                     'PERIOD_END_DAY', purposes."PERIOD_END_DAY",
                     'PERIOD_END_MONTH', purposes."PERIOD_END_MONTH",
                     'PERIOD_ST_DAY', purposes."PERIOD_ST_DAY",
                     'PERIOD_ST_MONTH', purposes."PERIOD_ST_MONTH",
                     'ANNUAL_QTY', purposes."ANNUAL_QTY",
                     'DAILY_QTY', purposes."DAILY_QTY",
                     'FGAC_REGION_CODE', purposes."FGAC_REGION_CODE",
                     'ID', purposes."ID",
                     'HOURLY_QTY', purposes."HOURLY_QTY",
                     'INST_QTY', purposes."INST_QTY",
                     'NOTES', purposes."NOTES",
                     'APUR_APPR_CODE', purposes."APUR_APPR_CODE",
                     'APUR_APSE_CODE', purposes."APUR_APSE_CODE",
                     'APUR_APUS_CODE', purposes."APUR_APUS_CODE",
                     'TIMELTD_END_DATE', purposes."TIMELTD_END_DATE",
                     'TIMELTD_ST_DATE', purposes."TIMELTD_ST_DATE"
                              )
                     )
              FROM import."NALD_ABS_LIC_PURPOSES" purposes
              WHERE purposes."AABV_AABL_ID" = versions."AABL_ID"
                AND purposes."AABV_ISSUE_NO" = versions."ISSUE_NO"
                AND purposes."AABV_INCR_NO" = versions."INCR_NO"
                AND purposes."FGAC_REGION_CODE" = versions."FGAC_REGION_CODE") AS purposes
      FROM import."NALD_ABS_LIC_VERSIONS" versions
      WHERE versions."FGAC_REGION_CODE" = ?
        AND versions."AABL_ID" = ?
        AND versions."STATUS" <> 'DRAFT';
  `

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

module.exports = {
  go
}
