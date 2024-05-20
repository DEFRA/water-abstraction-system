'use strict'

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 * @module LicenceSetUpPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (chargeVersions, chargeVersionWorkflows = []) {
  return {
    chargeInformation: _chargeInformation(chargeVersions, chargeVersionWorkflows)
  }
}

function _chargeInformation (chargeVersions, chargeVersionWorkflows) {
  return [
    ..._chargeVersions(chargeVersions),
    ..._workflowRecords(chargeVersionWorkflows)
  ]
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
