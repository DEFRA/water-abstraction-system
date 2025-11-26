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
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence) {
  const { id, includeInPresrocBilling, licenceDocumentHeader, licenceRef, workflows, startDate } = licence

  const primaryUser = licence.$primaryUser()
  const ends = licence.$ends()

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    currentVersion: _currentVersion(licence, startDate),
    documentId: licenceDocumentHeader.id,
    ends,
    includeInPresrocBilling,
    licenceId: id,
    licenceRef,
    notification: supplementaryBillRunNotification(licence),
    pageTitle: `Licence summary ${licenceRef}`,
    pageTitleCaption: _licenceName(primaryUser, licence),
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
