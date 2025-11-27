'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page
 * @module SummaryHeadingPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { supplementaryBillingNotification } = require('./base-licences.presenter.js')
const { today } = require('../../lib/general.lib.js')

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
  const ends = licence.$ends()

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    currentVersion: _currentVersion(summary, startDate),
    licenceRef,
    notification: supplementaryBillingNotification(licence),
    pageTitle: `Licence summary ${licenceRef}`,
    pageTitleCaption: _licenceName(primaryUser, summary),
    primaryUser,
    warning: _warning(ends),
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

function _warning(ends) {
  if (!ends || ends.date > today()) {
    return null
  }

  const formattedDate = formatLongDate(ends.date)

  if (ends.reason === 'revoked') {
    return {
      text: `This licence was revoked on ${formattedDate}`,
      iconFallbackText: 'Warning'
    }
  }

  if (ends.reason === 'lapsed') {
    return {
      text: `This licence lapsed on ${formattedDate}`,
      iconFallbackText: 'Warning'
    }
  }

  return {
    text: `This licence expired on ${formattedDate}`,
    iconFallbackText: 'Warning'
  }
}

function _workflowWarning(workflows) {
  return workflows.some((workflow) => {
    return workflow.status === 'to_setup'
  })
}

module.exports = {
  go
}
