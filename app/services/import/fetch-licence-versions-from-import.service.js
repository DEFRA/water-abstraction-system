'use strict'

/**
 * Service for /import/licence
 * @module FetchImportLicenceVersionsService
 */
const { db } = require('../../../db/db.js')

async function go (licenceId, regionCode) {
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

//  These are need as the parser id lower casing any select args
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
