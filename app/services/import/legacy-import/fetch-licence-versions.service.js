'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceVersionsService
 */
const { db } = require('../../../../db/db.js')

/**
 * Gets the legacy licence versions
 *
 * Returns the legacy licence version purposes
 *
 * @param {LegacyLicenceType} licenceData
 * @returns {Promise<LegacyLicenceVersionsArray>}
 */
async function go (licenceData) {
  const { ID: licenceId, FGAC_REGION_CODE: regionCode } = licenceData

  return _getLicenceVersions(licenceId, regionCode)
}

async function _getLicenceVersions (licenceId, regionCode) {
  const query = `
      SELECT
            versions."EFF_END_DATE",
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
      WHERE versions."FGAC_REGION_CODE" = '${regionCode}'
        AND versions."AABL_ID" = '${licenceId}'
        AND versions."STATUS" <> 'DRAFT';
  `

  const { rows } = await db.raw(query)

  return rows
}

module.exports = {
  go
}

/**
 * A legacy licence version
 * @typedef {Object} LegacyLicenceVersionsType
 *
 * @property {string} EFF_END_DATE - date in UK format - can be 'null'
 * @property {string} EFF_ST_DATE - date in UK format
 * @property {string} INCR_NO - a number between 1 - 5
 * @property {string} ISSUE_NO - a number
 * @property {string} STATUS - enum - 'DRAFT', 'SUPER', 'CURR' (Draft will not be selected)
 * @property {string} FGAC_REGION_CODE
 * @property {string} AABL_ID
 * @property {LegacyLicenceVersionsPurposesType} purposes
 */

/**
 * An array of legacy licence versions.
 * @typedef {LegacyLicenceVersionsType[]} LegacyLicenceVersionsArray
 */

/**
 * @typedef {Object} LegacyLicenceVersionsPurposesType
 * @property {string} PERIOD_END_DAY - The end day of the period.
 * @property {string} PERIOD_END_MONTH - The end month of the period.
 * @property {string} PERIOD_ST_DAY - The start day of the period.
 * @property {string} PERIOD_ST_MONTH - The start month of the period.
 * @property {string} ANNUAL_QTY - The annual quantity.
 * @property {string} DAILY_QTY - The daily quantity.
 * @property {string} FGAC_REGION_CODE - The FGAC region code.
 * @property {string} ID - The identifier.
 * @property {string} HOURLY_QTY - The hourly quantity.
 * @property {string} INST_QTY - The instant quantity.
 * @property {string} NOTES - Additional notes.
 * @property {string} APUR_APPR_CODE - The APUR approval code.
 * @property {string} APUR_APSE_CODE - The APUR secondary code.
 * @property {string} APUR_APUS_CODE - The APUR usage code.
 * @property {string} TIMELTD_END_DATE - The time-limited end date.
 * @property {string} TIMELTD_ST_DATE - The time-limited start date.
 */
