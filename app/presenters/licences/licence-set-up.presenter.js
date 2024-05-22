'use strict'

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 * @module LicenceSetUpPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

const roles = {
  billing: 'billing',
  workflowEditor: 'charge_version_workflow_editor',
  workflowReviewer: 'charge_version_workflow_reviewer'
}

/**
 * Formats data for the `/licences/{id}/licence-set-up` view licence set up page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (chargeVersions, workflows, auth, licence) {
  return {
    ..._authorisedLinks(auth, licence),
    chargeInformation: _chargeInformation(chargeVersions, workflows, auth)
  }
}

function _authorisedLinks (auth, licence) {
  if (auth.credentials?.scope?.includes(roles.workflowEditor) && _isLessThanSixYearsOld(licence.startDate)) {
    return {
      setupNewCharge: `/licences/${licence.id}/charge-information/create`,
      makeLicenceNonChargeable: `/licences/${licence.id}/charge-information/non-chargeable-reason?start=1`
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

function _chargeVersions (licenceSetUp) {
  return licenceSetUp.map((chargeInformation) => {
    return {
      id: chargeInformation.id,
      startDate: chargeInformation.startDate ? formatLongDate(chargeInformation.startDate) : '-',
      endDate: chargeInformation.endDate ? formatLongDate(chargeInformation.endDate) : '-',
      status: _status(chargeInformation.status),
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

function _isLessThanSixYearsOld (date) {
  const sixYears = 6
  const timeStamp = { hour: 23, minutes: 59, seconds: 59, ms: 999 }
  const startDate = new Date(date)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(timeStamp.hour, timeStamp.minutes, timeStamp.seconds, timeStamp.ms)

  const sixYearsFromYesterday = new Date(yesterday.getTime())
  sixYearsFromYesterday.setFullYear(yesterday.getFullYear() - sixYears)

  return startDate > sixYearsFromYesterday
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
  if (workflow.status === 'to_setup' && auth.credentials?.scope?.includes(roles.workflowEditor)) {
    return _workflowActionEditor(workflow)
  } else if (auth.credentials?.scope?.includes(roles.workflowReviewer)) {
    return _workflowActionReviewer(workflow)
  } else {
    return []
  }
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
