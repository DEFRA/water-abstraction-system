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
    externalId: licenceVersion.external_id,
    increment: licenceVersion.increment_number,
    issue: licenceVersion.issue_no,
    startDate: licenceVersion.effective_start_date,
    status: statuses[licenceVersion.status]
  }
}

module.exports = {
  go
}
