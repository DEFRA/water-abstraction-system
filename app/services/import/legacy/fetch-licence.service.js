'use strict'

/**
 * Service for /import/licence
 * @module FetchLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence data for the licence ref from the import.NALD_ABS_LICENCES table
 *
 * @param {string} licenceRef - the licence ref
 *
 * @returns {Promise<ImportLegacyLicenceType>}
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

/**
 * An Import legacy licence
 *
 * @typedef {object} ImportLegacyLicenceType
 *
 * @property {string} AREP_AREA_CODE - historicalAreaCode
 * @property {string} AREP_EIUC_CODE - regionPrefix / regionalChargeArea
 * @property {string} AREP_LEAP_CODE - localEnvironmentAgencyPlanCode
 * @property {string} AREP_SUC_CODE - standardUnitChargeCode
 * @property {string} AREP_AREA_CODE - regions - historicalAreaCode
 * @property {string} AREP_EIUC_CODE - regions - regionPrefix / regionalChargeArea
 * @property {string} AREP_LEAP_CODE - regions - localEnvironmentAgencyPlanCode
 * @property {string} AREP_SUC_CODE - regions - standardUnitChargeCode
 * @property {string} EXPIRY_DATE
 * @property {string} ID
 * @property {string} LAPSED_DATE
 * @property {string} LIC_NO - Licence Ref
 */
