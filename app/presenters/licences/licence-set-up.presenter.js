'use strict'

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 * @module LicenceSetUpPresenter
 */

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licenceSetUp) {
  return {
    chargeVersions: _chargeVersions(licenceSetUp),
    workflowRecords: _workflowRecords(licenceSetUp)
  }
}

function _chargeVersions (licenceSetUp) {
  return licenceSetUp.map((chargeInformation) => {
    return {
      ...chargeInformation
    }
  })
}

function _workflowRecords (licenceSetUp) {
  return licenceSetUp.map((workflowRecord) => {
    return {
      ...workflowRecord
    }
  })
}

module.exports = {
  go
}
