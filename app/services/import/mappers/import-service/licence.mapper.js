'use strict'

/**
 * Maps the import data to the desired format
 * @module ImportServiceLicenceMapper
 */

//  Need to fix
const DATE_FORMAT = 'YYYY-MM-DD'
const NALD_FORMAT = 'DD/MM/YYYY'

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
function go (licence) {
  return {
    licence: _mapLicence(licence.licence)
  }
}

function formatNaldToISO (date) {
  console.log('Date: ', date)
  if (date === 'null') {
    return null
  }

  const [day, month, year] = date.split('/')

  return `${year}-${month}-${day}`
}

const mapNaldDate = (str) => {
  return formatNaldToISO(str)
  // if (str === 'null') {
  //   return null
  // }
  //
  // // return moment(str, NALD_FORMAT).format(DATE_FORMAT)
  // return str
}

const mapNull = (str) => { return str === 'null' ? null : str }

function _mapLicence (licence, licenceVersions) {
  const endDates = [
    licence.EXPIRY_DATE,
    licence.REV_DATE,
    licence.LAPSED_DATE
  ]
    .map(mapNull)
    .filter((value) => { return value })
    .map(mapNaldDate)

  return {
    licenceRef: licence.LIC_NO,
    // TODO: need the licence versions
    startDate: mapStartDate(licence, licenceVersions),
    endDate: getMinDate(endDates),
    // TODO: why is this empty ?
    documents: [],
    // TODO: why is this empty ?
    agreements: [],
    externalId: `${licence.FGAC_REGION_CODE}:${licence.ID}`,
    isWaterUndertaker: licence.AREP_EIUC_CODE.endsWith('SWC'),
    regions: getRegionData(licence),
    regionCode: parseInt(licence.FGAC_REGION_CODE, 10),
    expiredDate: mapNaldDate(licence.EXPIRY_DATE),
    lapsedDate: mapNaldDate(licence.LAPSED_DATE),
    revokedDate: mapNaldDate(licence.REV_DATE),
    // TODO: is this stored ?
    _nald: licence
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

const getMinDate = (arr) => {
  const sorted = getSortedDates(arr)

  return sorted.length === 0 ? null : sorted[0]
}

const getSortedDates = (arr) => {
  const sortedDates = arr
    .sort(function (a, b) {
      return new Date(b.date) - new Date(a.date)
    })

  console.log('Sorted dates', sortedDates)

  return sortedDates
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
  console.log('Licence', licence.ORIG_EFF_DATE)
  if (licence.ORIG_EFF_DATE !== 'null') {
    return mapNaldDate(licence.ORIG_EFF_DATE)
  }

  return licenceVersions
    .filter(isNotDraftLicenceVersion)
    .map(getLicenceVersionStartDate)
    .sort()
    .shift()
}

const isNotDraftLicenceVersion = (licenceVersion) => { return licenceVersion.STATUS !== 'DRAFT' }

const getLicenceVersionStartDate = (licenceVersion) => { return mapNaldDate(licenceVersion.EFF_ST_DATE) }

module.exports = {
  go
}
