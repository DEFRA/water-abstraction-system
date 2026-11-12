/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 * @module SetUpPresenter
 */

import { formatLongDate } from 'water-abstraction-engine/presenters/base.presenter.js'

import { supplementaryBillingNotification } from './base-licences.presenter.js'

const ROLES = {
  billing: 'billing',
  deleteAgreements: 'delete_agreements',
  manageAgreements: 'manage_agreements',
  workflowEditor: 'charge_version_workflow_editor',
  workflowReviewer: 'charge_version_workflow_reviewer'
}

const AGREEMENTS = {
  S126: 'Abatement',
  S127: 'Two-part tariff',
  S130S: 'Canal and Rivers Trust, supported source (S130S)',
  S130U: 'Canal and Rivers Trust, unsupported source (S130U)'
}

/**
 * Formats data for the `/licences/{id}/set-up` view licence set up page
 *
 * @param {module:ChargeVersionModel[]} chargeVersions - All charge versions records for the licence
 * @param {module:WorkflowModel[]} workflows - All in-progress workflow records for the licence
 * @param {module:LicenceAgreementModel[]} agreements - All agreements records for the licence
 * @param {module:ReturnVersionModel[]} returnVersions - All returns version records for the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
export default function setUpPresenter(chargeVersions, workflows, agreements, returnVersions, auth, licence) {
  const licenceData = {
    ends: licence.$ends(),
    licenceId: licence.id
  }

  return {
    agreements: _agreements(licenceData, agreements, auth),
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    chargeInformation: _chargeInformation(chargeVersions, workflows, auth),
    links: {
      agreements: _agreementLinks(auth, licenceData),
      chargeInformation: _chargeInformationLinks(auth, licenceData),
      recalculateBills: _recalculateBills(agreements, auth, licenceData),
      returnVersions: _returnVersionsLinks(licenceData, auth)
    },
    notification: supplementaryBillingNotification(licence),
    pageTitle: 'Licence set up',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    returnVersions: _returnVersions(returnVersions)
  }
}

function _agreements(licenceData, agreements, auth) {
  return agreements.map((agreement, index) => {
    return {
      action: _agreementActionLinks(licenceData, agreement, auth, index),
      description: AGREEMENTS[_financialAgreementCode(agreement)],
      endDate: agreement.endDate ? formatLongDate(agreement.endDate) : '',
      signedOn: agreement.signedOn ? formatLongDate(agreement.signedOn) : '',
      startDate: formatLongDate(agreement.startDate)
    }
  })
}

function _agreementActionLinks(licenceData, agreement, auth, index) {
  if (!auth.credentials.scope.includes(ROLES.manageAgreements)) {
    return []
  }

  if (_endsSixYearsAgo(licenceData.ends)) {
    return []
  }

  const actionLinks = []
  const hasNotEnded = agreement.endDate === null

  if (auth.credentials.scope.includes(ROLES.deleteAgreements)) {
    actionLinks.push({
      dataTest: `delete-agreement-${index}`,
      link: `/licences/${licenceData.licenceId}/agreements/${agreement.id}/delete`,
      text: 'Delete'
    })
  }

  if (hasNotEnded) {
    actionLinks.push({
      dataTest: `end-agreement-${index}`,
      link: `/licences/${licenceData.licenceId}/agreements/${agreement.id}/end`,
      text: 'End'
    })
  }

  return actionLinks
}

function _agreementLinks(auth, licenceData) {
  if (auth.credentials.scope.includes(ROLES.manageAgreements) && !_endsSixYearsAgo(licenceData.ends)) {
    return {
      setUpAgreement: `/licences/${licenceData.licenceId}/agreements/select-type`
    }
  }

  return {}
}

function _chargeInformationLinks(auth, licenceData) {
  if (auth.credentials.scope.includes(ROLES.workflowEditor) && !_endsSixYearsAgo(licenceData.ends)) {
    return {
      makeLicenceNonChargeable: `/licences/${licenceData.licenceId}/charge-information/non-chargeable-reason?start=1`,
      setupNewCharge: `/licences/${licenceData.licenceId}/charge-information/create`
    }
  }

  return {}
}

function _chargeInformation(chargeVersions, workflows, auth) {
  return [..._workflows(workflows, auth), ..._chargeVersions(chargeVersions)]
}

function _chargeVersions(chargeVersions) {
  return chargeVersions.map((chargeVersion, index) => {
    return {
      action: [
        {
          dataTest: `charge-version-${index}`,
          link: `/licences/${chargeVersion.licenceId}/charge-information/${chargeVersion.id}/view`,
          text: 'View'
        }
      ],
      endDate: chargeVersion.endDate ? formatLongDate(chargeVersion.endDate) : '',
      id: chargeVersion.id,
      reason: chargeVersion.changeReason?.description,
      startDate: formatLongDate(chargeVersion.startDate),
      status: chargeVersion.status
    }
  })
}

function _endsSixYearsAgo(endDate) {
  if (!endDate) {
    return null
  }

  const sixYears = 6
  const timeStamp = { hour: 23, minutes: 59, ms: 999, seconds: 59 }

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(timeStamp.hour, timeStamp.minutes, timeStamp.seconds, timeStamp.ms)

  const sixYearsFromYesterday = new Date(yesterday)

  sixYearsFromYesterday.setFullYear(yesterday.getFullYear() - sixYears)

  return endDate.date < sixYearsFromYesterday
}

function _financialAgreementCode(agreement) {
  return agreement.financialAgreement.code
}

function _hasTwoPartTariffAgreement(agreements) {
  return agreements.some((agreement) => {
    return agreement.financialAgreement.code === 'S127'
  })
}

function _recalculateBills(agreements, auth, licenceData) {
  if (auth.credentials.scope.includes(ROLES.billing) && _hasTwoPartTariffAgreement(agreements)) {
    return { markForSupplementaryBilling: `/system/licences/${licenceData.licenceId}/mark-for-supplementary-billing` }
  }

  return {}
}

function _returnVersions(returnVersions = [{}]) {
  return returnVersions.map((returnVersion, index) => {
    return {
      action: [
        {
          dataTest: `return-version-${index}`,
          link: `/system/return-versions/${returnVersion.id}`,
          text: 'View'
        }
      ],
      endDate: returnVersion.endDate ? formatLongDate(returnVersion.endDate) : '',
      reason: returnVersion.$reason() ?? '',
      startDate: formatLongDate(returnVersion.startDate),
      status: returnVersion.status
    }
  })
}

function _returnVersionsLinks(licenceData, auth) {
  if (auth.credentials.scope.includes(ROLES.billing)) {
    return {
      noReturnsRequired: `/system/licences/${licenceData.licenceId}/no-returns-required`,
      returnsRequired: `/system/licences/${licenceData.licenceId}/returns-required`
    }
  }

  return {}
}

function _workflows(workflows, auth) {
  return workflows.map((workflow, index) => {
    return {
      action: _workflowAction(workflow, auth, index),
      endDate: '',
      id: workflow.id,
      reason: workflow.data.chargeVersion?.changeReason?.description,
      startDate: _workflowStartDate(workflow),
      status: workflow.status
    }
  })
}

function _workflowAction(workflow, auth, index) {
  if (workflow.status === 'to_setup' && auth.credentials.scope.includes(ROLES.workflowEditor)) {
    return _workflowActionEditor(workflow, index)
  }

  if (auth.credentials.scope.includes(ROLES.workflowReviewer)) {
    return _workflowActionReviewer(workflow, index)
  }

  return []
}

function _workflowActionEditor(workflow, index) {
  return [
    {
      dataTest: `set-up-charge-version-${index}`,
      link: `/licences/${workflow.licenceId}/charge-information/create?chargeVersionWorkflowId=${workflow.id}`,
      text: 'Set up'
    },
    {
      dataTest: `remove-charge-version-${index}`,
      link: `/charge-information-workflow/${workflow.id}/remove`,
      text: 'Remove'
    }
  ]
}

function _workflowActionReviewer(workflow, index) {
  return [
    {
      dataTest: `review-charge-version-${index}`,
      link: `/licences/${workflow.licenceId}/charge-information/${workflow.id}/review`,
      text: 'Review'
    }
  ]
}

function _workflowStartDate(workflow) {
  if (workflow.status === 'to_setup') {
    return ''
  }

  // Stored as JSON the date is returned as a string. So, we need to convert it to a date type first
  const startDate = new Date(workflow.data.chargeVersion.dateRange.startDate)

  return formatLongDate(startDate)
}
