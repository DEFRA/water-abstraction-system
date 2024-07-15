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

  return mapUsedColumns(rows)
}

/**
 * Maps licence versions to the required format / data
 *
 * @param {{}} rows - the licence version columns
 * @returns {LegacyLicenceVersionsArray}
 */
function mapUsedColumns (rows) {
  return rows.map((row) => {
    return {
      EFF_ST_DATE: row.EFF_ST_DATE
    }
  })
}

module.exports = {
  go
}

/**
 * A legacy licence version - the only data we require
 * @typedef {Object} LegacyLicenceVersionsType
 *
 * @property {string} EFF_ST_DATE - date in UK format | 'null'
 */

/**
 * An array of legacy licence versions.
 * @typedef {LegacyLicenceVersionsType[]} LegacyLicenceVersionsArray
 */
