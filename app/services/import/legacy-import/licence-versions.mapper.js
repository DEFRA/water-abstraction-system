'use strict'

/**
 * Maps the import licence versions data to the desired format
 * @module LegacyImportLicenceVersionMapper
 */

const { formatStandardDateToISO } = require('../../../lib/dates.lib.js')

const statuses = {
  CURR: 'current',
  SUPER: 'superseded',
  DRAFT: 'draft'
}

const createExternalId = (licenceVersion) => {
  const { FGAC_REGION_CODE, AABL_ID, ISSUE_NO, INCR_NO } = licenceVersion

  return `${FGAC_REGION_CODE}:${AABL_ID}:${ISSUE_NO}:${INCR_NO}`
}

/**
 * Maps the import licence versions data to the desired format
 *
 * @param {LegacyLicenceVersionsArray} licenceVersions
 * @returns {ImportLicenceVersionType[]}
 */
function go (licenceVersions) {
  return _mapLicenceVersions(licenceVersions)
}

/**
 * Iterates the import licence versions
 *
 * @param {LegacyLicenceVersionsArray} licenceVersions
 * @returns {ImportLicenceVersionType[]}
 */
function _mapLicenceVersions (licenceVersions) {
  return licenceVersions.map((licenceVersion) => {
    const issue = licenceVersion.ISSUE_NO // mapped to the legacy purpose id -
    const increment = licenceVersion.INCR_NO

    return {
      createdAt: new Date().toISOString(),
      endDate: formatStandardDateToISO(licenceVersion.EFF_END_DATE),
      externalId: createExternalId(licenceVersion),
      increment: Number(increment),
      issue: Number(issue),
      startDate: formatStandardDateToISO(licenceVersion.EFF_ST_DATE),
      status: statuses[licenceVersion.STATUS],
      updatedAt: new Date().toISOString(),
      purposes: _mapPurposes(licenceVersion)
    }
  })
}

/**
 * Iterates the import licence versions purposes
 *
 * @param {LegacyLicenceVersionsType} licenceVersion
 * @returns {ImportLicenceVersionPurposeType}
 */
function _mapPurposes (licenceVersion) {
  return licenceVersion.purposes.map((purpose) => {
    return _mapPurpose(purpose)
  })
}

/**
 * Maps the import licence versions purposes data to the desired format
 *
 * @param {LegacyLicenceVersionsPurposesType} purpose
 * @returns {ImportLicenceVersionPurposeType}
 */
const _mapPurpose = (purpose) => {
  return {
    abstractionPeriodEndDay: Number(purpose.PERIOD_END_DAY),
    abstractionPeriodEndMonth: Number(purpose.PERIOD_END_MONTH),
    abstractionPeriodStartDay: Number(purpose.PERIOD_ST_DAY),
    abstractionPeriodStartMonth: Number(purpose.PERIOD_ST_MONTH),
    annualQuantity: purpose.ANNUAL_QTY === 'null' ? null : Number(purpose.ANNUAL_QTY),
    dailyQuantity: purpose.DAILY_QTY === 'null' ? null : Number(purpose.DAILY_QTY),
    externalId: `${purpose.FGAC_REGION_CODE}:${purpose.ID}`,
    hourlyQuantity: purpose.HOURLY_QTY === 'null' ? null : Number(purpose.HOURLY_QTY),
    instantQuantity: purpose.INST_QTY === 'null' ? null : Number(purpose.INST_QTY),
    notes: purpose.NOTES === 'null' ? null : purpose.NOTES,
    primaryPurposeId: purpose.APUR_APPR_CODE,
    secondaryPurposeId: purpose.APUR_APSE_CODE,
    purposeId: purpose.APUR_APUS_CODE,
    timeLimitedEndDate: formatStandardDateToISO(purpose.TIMELTD_END_DATE),
    timeLimitedStartDate: formatStandardDateToISO(purpose.TIMELTD_ST_DATE)
  }
}

module.exports = {
  go
}
