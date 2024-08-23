'use strict'

/**
 * Maps legacy NALD licence version data to the WRLS format
 * @module LicenceVersionPresenter
 */

const statuses = {
  CURR: 'current',
  SUPER: 'superseded'
}

/**
 * Maps legacy NALD licence version data to the WRLS format
 *
 * @param {ImportLegacyLicenceVersionTyp} licenceVersion - the legacy NALD licence version
 *
 * @returns {object} the NALD licence version data transformed into the WRLS format ready for validation and persisting
 */
function go (licenceVersion) {
  return {
    endDate: licenceVersion.effective_end_date,
    externalId: _externalId(licenceVersion),
    increment: licenceVersion.increment_number,
    issue: licenceVersion.issue_no,
    startDate: licenceVersion.effective_start_date,
    status: statuses[licenceVersion.status]
  }
}

function _externalId (licenceVersion) {
  const { region_code: regionCode, id, issue_no: issueNo, increment_number: incrementNo } = licenceVersion

  return `${regionCode}:${id}:${issueNo}:${incrementNo}`
}

module.exports = {
  go
}
