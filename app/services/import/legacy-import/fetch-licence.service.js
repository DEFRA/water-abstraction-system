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
  const query = `
      SELECT
          licence."AREP_AREA_CODE",
          licence."AREP_EIUC_CODE",
          licence."AREP_LEAP_CODE",
          licence."AREP_SUC_CODE",
          licence."EXPIRY_DATE",
          licence."FGAC_REGION_CODE",
          licence."ID",
          licence."LAPSED_DATE",
          licence."LIC_NO",
          licence."ORIG_EFF_DATE",
          licence."REV_DATE"
      FROM import."NALD_ABS_LICENCES" licence
      WHERE licence."LIC_NO" = '${licenceRef}';
  `

  const { rows: [row] } = await db.raw(query)

  return row
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
