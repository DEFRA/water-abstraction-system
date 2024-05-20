'use strict'

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 * @module LicenceSetUpPresenter
 */

const { formatLongDate, titleCase } = require('../base.presenter')

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
      id: chargeInformation.id,
      startDate: chargeInformation.startDate ? formatLongDate(chargeInformation.startDate) : '-',
      endDate: chargeInformation.endDate ? formatLongDate(chargeInformation.endDate) : '-',
      status: _chargeVersionStatus(chargeInformation.status),
      reason: chargeInformation.changeReason?.description
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

function _chargeVersionStatus (status) {
  const statues = {
    current: 'approved',
    draft: 'draft',
    approved: 'approved',
    replaced: 'replaced',
    superseded: 'replaced',
    invalid: 'invalid',
    review: 'review',
    changes_requested: 'change request',
    to_setup: 'to set up'
  }

  return statues[status]
}

module.exports = {
  go
}
