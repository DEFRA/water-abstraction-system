'use strict'

/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 * @module SetUpPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

const roles = {
  billing: 'billing',
  deleteAgreements: 'delete_agreements',
  manageAgreements: 'manage_agreements',
  workflowEditor: 'charge_version_workflow_editor',
  workflowReviewer: 'charge_version_workflow_reviewer'
}

const agreementDescriptions = {
  S127: 'Two-part tariff',
  S130S: 'Canal and Rivers Trust, supported source (S130S)',
  S130U: 'Canal and Rivers Trust, unsupported source (S130U)',
  S126: 'Abatement'
}

/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 *
 * @param {module:ChargeVersionModel[]} chargeVersions - All charge versions records for the licence
 * @param {module:WorkflowModel[]} workflows - All in-progress workflow records for the licence
 * @param {module:LicenceAgreementModel[]} agreements - All agreements records for the licence
 * @param {module:ReturnVersionModel[]} returnVersions - All returns version records for the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} commonData - Licence data already formatted for the view's shared elements
 *
 * @returns {object} The data formatted for the view template
 */
function go (chargeVersions, workflows, agreements, returnVersions, auth, commonData) {
  const enableRequirementsForReturns = FeatureFlagsConfig.enableRequirementsForReturns
  const enableTwoPartSupplementary = FeatureFlagsConfig.enableTwoPartTariffSupplementary

  return {
    links: {
      chargeInformation: _chargeInformationLinks(auth, commonData),
      agreements: _agreementLinks(auth, commonData),
      returnVersions: _returnVersionsLinks(commonData, enableRequirementsForReturns),
      recalculateBills: _recalculateBills(agreements, auth, commonData, enableTwoPartSupplementary)
    },
    agreements: _agreements(commonData, agreements, auth, enableTwoPartSupplementary),
    chargeInformation: _chargeInformation(chargeVersions, workflows, auth),
    returnVersions: _returnVersions(returnVersions)
  }
}

function _agreements (commonData, agreements, auth, enableTwoPartSupplementary) {
  return agreements.map((agreement) => {
    return {
      startDate: formatLongDate(agreement.startDate),
      endDate: agreement.endDate ? formatLongDate(agreement.endDate) : '',
      description: agreementDescriptions[_financialAgreementCode(agreement)],
      signedOn: agreement.signedOn ? formatLongDate(agreement.signedOn) : '',
      action: _agreementActionLinks(commonData, agreement, auth, enableTwoPartSupplementary)
    }
  })
}

function _agreementActionLinks (commonData, agreement, auth, enableTwoPartSupplementary) {
  if (!auth.credentials.scope.includes(roles.manageAgreements)) {
    return []
  }

  if (_endsSixYearsAgo(commonData.ends)) {
    return []
  }

  const actionLinks = []
  const hasNotEnded = agreement.endDate === null

  if (auth.credentials.scope.includes(roles.deleteAgreements)) {
    actionLinks.push({
      text: 'Delete',
      link: `/licences/${commonData.licenceId}/agreements/${agreement.id}/delete`
    })
  }

  if (hasNotEnded) {
    actionLinks.push({
      text: 'End',
      link: `/licences/${commonData.licenceId}/agreements/${agreement.id}/end`
    })
  }

  // Feature flag for the new two-part tariff supplementary
  if (!enableTwoPartSupplementary) {
    const is2PTAgreement = _financialAgreementCode(agreement) === 'S127'
    const isNotMarkedForSupplementaryBilling = commonData.includeInPresrocBilling === 'no'

    if (hasNotEnded && is2PTAgreement && isNotMarkedForSupplementaryBilling &&
      auth.credentials.scope.includes(roles.billing)) {
      actionLinks.push({
        text: 'Recalculate bills',
        link: `/licences/${commonData.licenceId}/mark-for-supplementary-billing`
      })
    }
  }

  return actionLinks
}

function _agreementLinks (auth, commonData) {
  if (auth.credentials.scope.includes(roles.manageAgreements) && !_endsSixYearsAgo(commonData.ends)) {
    return {
      setUpAgreement: `/licences/${commonData.licenceId}/agreements/select-type`
    }
  }

  return {}
}

function _chargeInformationLinks (auth, commonData) {
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
      endDate: chargeVersion.endDate ? formatLongDate(chargeVersion.endDate) : '',
      status: chargeVersion.status,
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

function _financialAgreementCode (agreement) {
  return agreement.financialAgreement.code
}

function _hasTwoPartTariffAgreement (agreements) {
  return agreements.some((agreement) => {
    return agreement.financialAgreement.code === 'S127'
  })
}

/**
 * The history helper $reason() will return either the reason saved against the return version record, the reason
 * captured in the first mod log entry, or null.
 *
 * If its the reason saved against the return version we have to map it to its display version first.
 *
 * @private
 */
function _reason (returnVersion) {
  const reason = returnVersion.$reason()
  const mappedReason = returnRequirementReasons[reason]

  if (mappedReason) {
    return mappedReason
  }

  return reason ?? ''
}

function _recalculateBills (agreements, auth, commonData, enableTwoPartSupplementary) {
  if (auth.credentials.scope.includes(roles.billing) &&
    _hasTwoPartTariffAgreement(agreements) &&
    enableTwoPartSupplementary
  ) {
    return { markForSupplementaryBilling: `/system/licences/${commonData.licenceId}/mark-for-supplementary-billing` }
  }

  return {}
}

function _returnVersions (returnVersions = [{}]) {
  return returnVersions.map((returnVersion) => {
    return {
      action: [{
        text: 'View',
        link: `/system/return-requirements/${returnVersion.id}`
      }],
      endDate: returnVersion.endDate ? formatLongDate(returnVersion.endDate) : '',
      reason: _reason(returnVersion),
      startDate: formatLongDate(returnVersion.startDate),
      status: returnVersion.status
    }
  })
}

function _returnVersionsLinks (commonData, enableRequirementsForReturns) {
  if (enableRequirementsForReturns) {
    return {
      returnsRequired: `/system/licences/${commonData.licenceId}/returns-required`,
      noReturnsRequired: `/system/licences/${commonData.licenceId}/no-returns-required`
    }
  }

  return {}
}

function _workflows (workflows, auth) {
  return workflows.map((workflow) => {
    return {
      action: _workflowAction(workflow, auth),
      endDate: '',
      id: workflow.id,
      reason: workflow.data.chargeVersion?.changeReason?.description,
      startDate: _workflowStartDate(workflow),
      status: workflow.status
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

function _workflowStartDate (workflow) {
  if (workflow.status === 'to_setup') {
    return ''
  }

  // Stored as JSON the date is returned as a string. So, we need to convert it to a date type first
  const startDate = new Date(workflow.data.chargeVersion.dateRange.startDate)

  return formatLongDate(startDate)
}

module.exports = {
  go
}
