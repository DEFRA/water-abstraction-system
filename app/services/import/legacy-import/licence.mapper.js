'use strict'

/**
 * Maps the import data to the desired format
 * @module LegacyImportLicenceMapper
 */

const { formatStandardDateToISO } = require('../../../lib/dates.lib.js')
const { regions } = require('./constants.js')

/**
 * Maps the import data to the desired format
 *
 * @param {string} licence - The licence reference of the licence
 * @param {LegacyLicenceVersionsArray} licenceVersions
 * @returns {ValidLicenceType}
 */
function go (licence, licenceVersions = []) {
  return _mapLicence(licence, licenceVersions)
}

function _mapLicence (licence, licenceVersions) {
  return {
    expiredDate: formatStandardDateToISO(licence.EXPIRY_DATE),
    lapsedDate: formatStandardDateToISO(licence.LAPSED_DATE),
    licenceRef: licence.LIC_NO,
    naldRegionId: parseInt(licence.FGAC_REGION_CODE, 10),
    regions: _regionData(licence),
    revokedDate: formatStandardDateToISO(licence.REV_DATE),
    startDate: _startDate(licence, licenceVersions),
    waterUndertaker: licence.AREP_EIUC_CODE.endsWith('SWC')
  }
}

/**
 * Creates a JSON object of the region data
 *
 * @param {Object} licenceData
 * @return {RegionsType}
 */
const _regionData = (licenceData) => {
  const historicalAreaCode = licenceData.AREP_AREA_CODE
  const regionPrefix = licenceData.AREP_EIUC_CODE.substr(0, 2)
  const regionalChargeArea = regions[regionPrefix]
  const standardUnitChargeCode = licenceData.AREP_SUC_CODE
  const localEnvironmentAgencyPlanCode = licenceData.AREP_LEAP_CODE

  return { historicalAreaCode, regionalChargeArea, standardUnitChargeCode, localEnvironmentAgencyPlanCode }
}

/**
 * Maps the licence and licence versions to a start date.
 * If the licence ORIG_EFF_DATE is not null, this is used.
 * Otherwise the start date of the earliest non-draft licence
 * version is used.
 *
 * It is assumed one of these will always exist
 *
 * @param {Object} licence
 * @param {Object} licenceVersions
 * @return {String} YYYY-MM-DD
 */
const _startDate = (licence, licenceVersions) => {
  if (licence.ORIG_EFF_DATE !== 'null') {
    return formatStandardDateToISO(licence.ORIG_EFF_DATE)
  }

  return licenceVersions
    .filter((version) => { return version.STATUS !== 'DRAFT' })
    .map((version) => {
      return formatStandardDateToISO(version.EFF_ST_DATE)
    })
    .sort()
    .shift()
}

module.exports = {
  go
}
