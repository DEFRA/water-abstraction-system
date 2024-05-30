'use strict'

/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 * @module SetUpPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

const roles = {
  workflowEditor: 'charge_version_workflow_editor',
  workflowReviewer: 'charge_version_workflow_reviewer'
}

/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 *
 * @param {module:ChargeVersionModel[]} chargeVersions - All charge versions records for the licence
 * @param {module:WorkflowModel[]} workflows - All in-progress workflow records for the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 * @param {Object} commonData - Licence data already formatted for the view's shared elements
 *
 * @returns {Object} The data formatted for the view template
 */
function go (chargeVersions, workflows, auth, commonData) {
  return {
    ..._authorisedLinks(auth, commonData),
    chargeInformation: _chargeInformation(chargeVersions, workflows, auth)
  }
}

function _authorisedLinks (auth, commonData) {
  if (auth.credentials.scope.includes(roles.workflowEditor) && !_endsSixYearsAgo(commonData.ends)) {
    return {
      setupNewCharge: `/licences/${commonData.licenceId}/charge-information/create`,
      makeLicenceNonChargeable: `/licences/${commonData.licenceId}/charge-information/non-chargeable-reason?start=1`
    }
  }

  return {}
}

function _chargeInformation (chargeVersions, workflows, auth) {
  return [
    ..._workflows(workflows, auth),
    ..._chargeVersions(chargeVersions)
  ]
}

function _chargeVersions (chargeVersions) {
  return chargeVersions.map((chargeVersion) => {
    return {
      id: chargeVersion.id,
      startDate: formatLongDate(chargeVersion.startDate),
      endDate: chargeVersion.endDate ? formatLongDate(chargeVersion.endDate) : '-',
      status: _status(chargeVersion.status),
      reason: chargeVersion.changeReason?.description,
      action: [
        {
          text: 'View',
          link: `/licences/${chargeVersion.licenceId}/charge-information/${chargeVersion.id}/view`
        }
      ]
    }
  })
}

function _endsSixYearsAgo (endDate) {
  if (!endDate) {
    return null
  }

  const sixYears = 6
  const timeStamp = { hour: 23, minutes: 59, seconds: 59, ms: 999 }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(timeStamp.hour, timeStamp.minutes, timeStamp.seconds, timeStamp.ms)

  const sixYearsFromYesterday = new Date(yesterday.getTime())
  sixYearsFromYesterday.setFullYear(yesterday.getFullYear() - sixYears)

  return endDate.date < sixYearsFromYesterday
}

function _status (status) {
  const statuses = {
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

  return statuses[status]
}

function _workflows (workflows, auth) {
  return workflows.map((workflow) => {
    return {
      action: _workflowAction(workflow, auth),
      endDate: '-',
      id: workflow.id,
      reason: workflow.data.chargeVersion?.changeReason?.description,
      startDate: workflow.createdAt ? formatLongDate(workflow.createdAt) : '-',
      status: _status(workflow.status)
    }
  })
}

function _workflowAction (workflow, auth) {
  if (workflow.status === 'to_setup' && auth.credentials.scope.includes(roles.workflowEditor)) {
    return _workflowActionEditor(workflow)
  }

  if (auth.credentials.scope.includes(roles.workflowReviewer)) {
    return _workflowActionReviewer(workflow)
  }

  return []
}

function _workflowActionEditor (workflow) {
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
}

function _workflowActionReviewer (workflow) {
  return [
    {
      text: 'Review',
      link: `/licences/${workflow.licenceId}/charge-information/${workflow.id}/review`
    }
  ]
}

module.exports = {
  go
}
