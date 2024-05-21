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
function go (chargeVersions, workflows, auth) {
  return {
    chargeInformation: _chargeInformation(chargeVersions, workflows, auth)
  }
}

function _chargeInformation (chargeVersions, workflows, auth) {
  return [
    ..._workflows(workflows, auth),
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

function _workflows (workflows, auth) {
  return workflows.map((workflow) => {
    return {
      id: workflow.id,
      startDate: workflow.createdAt ? formatLongDate(workflow.createdAt) : '-',
      endDate: '-',
      status: _chargeVersionStatus(workflow.status),
      reason: workflow.data.chargeVersion.changeReason.description,
      action: _workflowAction(workflow, auth)
    }
  })
}

function _workflowAction (workflow, auth) {
  if (workflow.status === 'to_setup' && auth.credentials?.scope?.includes('charge_version_workflow_editor')) {
    return [
      {
        text: 'Set up',
        link: `/licences/${workflow.licenceId}/charge-information/create?chargeVersionWorkflowId=${workflow.id}`
      },
      {
        text: 'Remove',
        link: `/charge-information-workflow/${workflow.id}/remove`
      }
    ]
  } else if (auth.credentials?.scope?.includes('charge_version_workflow_reviewer')) {
    return [
      {
        text: 'Review',
        link: `/licences/${workflow.licenceId}/charge-information/${workflow.id}/review`
      }
    ]
  }

  return []
}

module.exports = {
  go
}
