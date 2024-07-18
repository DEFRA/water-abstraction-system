'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceVersionsService
 */
const { db } = require('../../../../db/db.js')

async function go (licenceData) {
  const { ID: licenceId, FGAC_REGION_CODE: regionCode } = licenceData

  return _getLicenceVersions(licenceId, regionCode)
}

async function _getLicenceVersions (licenceId, regionCode) {
  const query = `
      SELECT *
      FROM import."NALD_ABS_LIC_VERSIONS" v
      WHERE v."FGAC_REGION_CODE" = '${regionCode}'
        AND v."AABL_ID" = '${licenceId}'
        AND v."STATUS" <> 'DRAFT';`

  const { rows } = await db.raw(query)

  return select(rows)
}

/**
 * Maps licence versions to the required format / data
 *
 * @param {{}} rows - the licence version columns
 * @returns {LegacyLicenceVersionsArray}
 */
function select (rows) {
  return rows.map((row) => {
    return {
      EFF_END_DATE: row.EFF_END_DATE,
      EFF_ST_DATE: row.EFF_ST_DATE,
      INCR_NO: row.INCR_NO,
      ISSUE_NO: row.ISSUE_NO,
      STATUS: row.STATUS,
      //  can use region code from licence ?
      FGAC_REGION_CODE: row.FGAC_REGION_CODE,
      AABL_ID: row.AABL_ID
    }
  })
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
 * @property {string} ISSUE_NO - a number - linked to the purpose id ?
 * @property {string} STATUS - enum - 'DRAFT', 'SUPER', 'CURR' (Draft will not be selected)
 * @property {string} FGAC_REGION_CODE
 * @property {string} AABL_ID
 */

/**
 * An array of legacy licence versions.
 * @typedef {LegacyLicenceVersionsType[]} LegacyLicenceVersionsArray
 */
