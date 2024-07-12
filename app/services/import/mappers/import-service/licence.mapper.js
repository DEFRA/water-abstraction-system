'use strict'

/**
 * Maps the import data to the desired format
 * @module ImportServiceLicenceMapper
 */

const { formatNaldToISO } = require('../../helpers/dates.js')

const regions = {
  AN: 'Anglian',
  MD: 'Midlands',
  NO: 'Northumbria',
  NW: 'North West',
  SO: 'Southern',
  SW: 'South West (incl Wessex)',
  TH: 'Thames',
  WL: 'Wales',
  YO: 'Yorkshire'
}

/**
 * Maps the import data to the desired format
 *
 * @param {string} licence - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the `licence` needed to persist the licence
 */
function go (licence, licenceVersions = []) {
  console.log('LV', licenceVersions)

  return _mapLicence(licence, licenceVersions)
}

function _mapLicence (licence, licenceVersions) {
  return {
    expiredDate: formatNaldToISO(licence.EXPIRY_DATE),
    lapsedDate: formatNaldToISO(licence.LAPSED_DATE),
    licenceRef: licence.LIC_NO,
    naldRegionId: parseInt(licence.FGAC_REGION_CODE, 10),
    regions: getRegionData(licence),
    revokedDate: formatNaldToISO(licence.REV_DATE),
    startDate: mapStartDate(licence, licenceVersions),
    waterUndertaker: licence.AREP_EIUC_CODE.endsWith('SWC')
  }
}

const getRegionData = (licenceData) => {
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
 * @param {Object} licence
 * @param {Object} licenceVersions
 * @return {String} YYYY-MM-DD
 */
const mapStartDate = (licence, licenceVersions) => {
  if (licence.ORIG_EFF_DATE !== 'null') {
    return formatNaldToISO(licence.ORIG_EFF_DATE)
  }

  // TODO: assume a licence versions must exists if no start date ORIG_EFF_DATE ?
  // Not draft is handle in the database query ? should we keep here for resps
  return licenceVersions
    .map((version) => {
      return formatNaldToISO(version.EFF_ST_DATE)
    })
    .sort()
    .shift()
}

module.exports = {
  go
}
