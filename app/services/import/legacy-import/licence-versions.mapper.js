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
function go (licenceVersions, licenceId) {
  return _mapLicenceVersions(licenceVersions)
}

function _mapLicenceVersions (licenceVersions) {
  return licenceVersions.map((licenceVersion) => {
    const issue = licenceVersion.ISSUE_NO
    const increment = licenceVersion.INCR_NO

    return {
      createdAt: new Date().toISOString(),
      endDate: formatStandardDateToISO(licenceVersion.EFF_END_DATE),
      externalId: createExternalId(licenceVersion),
      increment: Number(increment),
      issue: Number(issue),
      startDate: formatStandardDateToISO(licenceVersion.EFF_ST_DATE),
      status: statuses[licenceVersion.STATUS],
      updatedAt: new Date().toISOString()
    }
  })
}

module.exports = {
  go
}
