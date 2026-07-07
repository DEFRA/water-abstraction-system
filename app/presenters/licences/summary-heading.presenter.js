/**
 * Formats data for the `/licences/{id}/summary` page
 * @module SummaryHeadingPresenter
 */

import { formatLongDate } from '../base.presenter.js'
import { licenceEndsWarning } from '../licence.presenter.js'
import { supplementaryBillingNotification } from './base-licences.presenter.js'

/**
 * Formats data for the `/licences/{id}/summary` page
 *
 * @param {object} licence - the licence data returned by `FetchLicenceService`
 * @param {object} summary - the summary data returned by `FetchSummaryService`
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence, summary) {
  const { licenceRef } = licence

  const { workflows, startDate } = summary

  const primaryUser = summary.$primaryUser()

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    currentVersion: _currentVersion(summary, startDate),
    licenceRef,
    notification: supplementaryBillingNotification(licence),
    pageTitle: `Licence summary ${licenceRef}`,
    pageTitleCaption: _licenceName(primaryUser, summary),
    primaryUser,
    warning: licenceEndsWarning(licence),
    workflowWarning: _workflowWarning(workflows)
  }
}

function _currentVersion(licence, startDate) {
  const currentVersion = licence.$currentVersion()

  if (currentVersion?.startDate) {
    return `The current version of the licence starting ${formatLongDate(currentVersion.startDate)}`
  }

  return `The current version of the licence starting ${formatLongDate(startDate)}`
}

function _licenceName(primaryUser, licence) {
  if (!primaryUser) {
    return 'Unregistered licence'
  }

  const licenceName = licence.$licenceName()

  return licenceName ?? null
}

function _workflowWarning(workflows) {
  return workflows.some((workflow) => {
    return workflow.status === 'to_setup'
  })
}

export {
  go
}
export default {
  go
}
