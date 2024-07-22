'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceService
 */
const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data for the licence ref from the import.NALD_ABS_LICENCES table
 *
 * @param {string} licenceRef - the licence ref
 * @returns {Promise<LegacyLicenceType>}
 */
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

/**
 * Fetches the licence data for the licence ref from the import.NALD_ABS_LICENCES table
 *
 * @param {any} licence
 * @returns {LegacyLicenceType}
 */
// TODO: remove this for the select
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

/**
 * A legacy licence
 *
 * @typedef {Object} LegacyLicenceType
 *
 * @property {string} AREP_AREA_CODE
 * @property {string} AREP_EIUC_CODE
 * @property {string} AREP_LEAP_CODE
 * @property {string} AREP_SUC_CODE
 * @property {string} EXPIRY_DATE
 * @property {string} ID
 * @property {string} LAPSED_DATE
 * @property {string} LIC_NO
 * @property {string} ORIG_EFF_DATE
 * @property {string} REV_DATE
 *
 */
