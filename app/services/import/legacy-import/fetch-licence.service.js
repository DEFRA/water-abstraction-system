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
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 * - {string} AREP_AREA_CODE - regions - historicalAreaCode
 * - {string} AREP_EIUC_CODE - regions - regionPrefix / regionalChargeArea
 * - {string} AREP_LEAP_CODE - regions - localEnvironmentAgencyPlanCode
 * - {string} AREP_SUC_CODE - regions - standardUnitChargeCode
 * - {string} EXPIRY_DATE
 * - {string} ID
 * - {string} LAPSED_DATE
 * - {string} LIC_NO
 * - {string} ORIG_EFF_DATE
 * - {string} REV_DATE
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
      WHERE licence."LIC_NO" = ?;
  `

  const { rows: [row] } = await db.raw(query, [licenceRef])

  return row
}

module.exports = {
  go
}
