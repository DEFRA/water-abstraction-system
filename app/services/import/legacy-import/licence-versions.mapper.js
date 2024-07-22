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
 * @returns {}
 */
function go (licenceVersions) {
  return _mapLicenceVersions(licenceVersions)
}

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

function _mapPurposes (licenceVersion) {
  return licenceVersion.purposes.map((purpose) => {
    return mapLicencePurpose(purpose)
  })
}

module.exports = {
  go
}

const mapLicencePurpose = (purpose) => {
  // double check no longer needed because of update sql
  // issue: purpose.AABV_ISSUE_NO,
  //   increment: purpose.AABV_INCR_NO,

  return {
    abstractionPeriodEndDay: purpose.PERIOD_END_DAY,
    abstractionPeriodEndMonth: purpose.PERIOD_END_MONTH,
    abstractionPeriodStartDay: purpose.PERIOD_ST_DAY,
    abstractionPeriodStartMonth: purpose.PERIOD_ST_MONTH,
    annualQuantity: purpose.ANNUAL_QTY === 'null' ? null : purpose.ANNUAL_QTY,
    dailyQuantity: purpose.DAILY_QTY === 'null' ? null : purpose.DAILY_QTY,
    externalId: `${purpose.FGAC_REGION_CODE}:${purpose.ID}`,
    hourlyQuantity: purpose.HOURLY_QTY === 'null' ? null : purpose.HOURLY_QTY,
    instantQuantity: purpose.INST_QTY === 'null' ? null : purpose.INST_QTY,
    notes: purpose.NOTES === 'null' ? null : purpose.NOTES,
    primaryPurposeId: purpose.APUR_APPR_CODE,
    secondaryPurposeId: purpose.APUR_APSE_CODE,
    purposeId: purpose.APUR_APUS_CODE,
    timeLimitedEndDate: formatStandardDateToISO(purpose.TIMELTD_END_DATE),
    timeLimitedStartDate: formatStandardDateToISO(purpose.TIMELTD_ST_DATE)
  }
}
