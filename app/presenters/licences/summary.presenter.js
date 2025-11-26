'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page
 * @module SummaryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { supplementaryBillRunNotification } = require('./base-licences.presenter.js')
const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/licences/{id}/summary` page
 *
 * @param {object} licence - the licence summary data returned by `FetchLicenceService`
 * @param {object} licenceSummary - the licence summary data returned by `FetchLicenceSummaryService`
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence, licenceSummary) {
  const { id, licenceRef } = licence

  const { workflows, startDate } = licenceSummary

  const primaryUser = licenceSummary.$primaryUser()
  const ends = licence.$ends()

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    currentVersion: _currentVersion(licenceSummary, startDate),
    licenceId: id,
    licenceRef,
    notification: supplementaryBillRunNotification(licence),
    pageTitle: `Licence summary ${licenceRef}`,
    pageTitleCaption: _licenceName(primaryUser, licenceSummary),
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
