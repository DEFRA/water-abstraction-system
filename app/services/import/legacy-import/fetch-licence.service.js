'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceService
 */
const { db } = require('../../../../db/db.js')

async function go (licenceRef) {
  return _getLicenceByRef(licenceRef)
}

async function _getLicenceByRef (licenceRef) {
  // TODO: granular select  ? map data to simplify if needs be
  const query = `
      SELECT *
      FROM import."NALD_ABS_LICENCES" l
      WHERE l."LIC_NO" = '${licenceRef}';
  `

  const { rows: [row] } = await db.raw(query)

  return select(row)
}

function select (licence) {
  return {
    AREP_AREA_CODE: licence.AREP_AREA_CODE,
    AREP_EIUC_CODE: licence.AREP_EIUC_CODE,
    AREP_LEAP_CODE: licence.AREP_LEAP_CODE,
    AREP_SUC_CODE: licence.AREP_SUC_CODE,
    EXPIRY_DATE: licence.EXPIRY_DATE,
    FGAC_REGION_CODE: licence.FGAC_REGION_CODE,
    ID: licence.ID,
    LAPSED_DATE: licence.LAPSED_DATE,
    LIC_NO: licence.LIC_NO,
    ORIG_EFF_DATE: licence.ORIG_EFF_DATE,
    REV_DATE: licence.REV_DATE
  }
}

module.exports = {
  go
}
