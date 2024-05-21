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
function go (chargeVersions, workflows) {
  return {
    chargeInformation: _chargeInformation(chargeVersions, workflows)
  }
}

function _chargeInformation (chargeVersions, workflows) {
  return [
    ..._workflows(workflows),
    ..._chargeVersions(chargeVersions)
  ]
}

function _chargeVersions (licenceSetUp) {
  return licenceSetUp.map((chargeInformation) => {
    return {
      id: chargeInformation.id,
      startDate: chargeInformation.startDate ? formatLongDate(chargeInformation.startDate) : '-',
      endDate: chargeInformation.endDate ? formatLongDate(chargeInformation.endDate) : '-',
      status: _chargeVersionStatus(chargeInformation.status),
      reason: chargeInformation.changeReason?.description,
      action: [
        {
          text: 'View',
          link: `/licences/${chargeInformation.licenceId}/charge-information/${chargeInformation.id}/view`
        }
      ]
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

function _workflows (workflows) {
  return workflows.map((workflowRecord) => {
    return {
      id: workflowRecord.id,
      startDate: workflowRecord.createdAt ? formatLongDate(workflowRecord.createdAt) : '-',
      endDate: '-',
      status: workflowRecord.status,
      reason: workflowRecord.data.chargeVersion.changeReason.description,
      action: []
    }
  })
}

module.exports = {
  go
}
