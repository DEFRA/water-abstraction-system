'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page
 * @module ViewLicenceSummaryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/licences/{id}/summary` page
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence) {
  const { id, includeInPresrocBilling, licenceDocumentHeader, licenceRef, workflows } = licence

  const primaryUser = licence.$primaryUser()
  const ends = licence.$ends()

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    documentId: licenceDocumentHeader.id,
    ends,
    includeInPresrocBilling,
    licenceId: id,
    licenceRef,
    notification: _notification(licence),
    pageTitle: `Licence summary ${licenceRef}`,
    pageTitleCaption: _licenceName(primaryUser, licence),
    primaryUser,
    warning: _warning(ends),
    workflowWarning: _workflowWarning(workflows)
  }
}

function _licenceName(primaryUser, licence) {
  if (!primaryUser) {
    return 'Unregistered licence'
  }

  const licenceName = licence.$licenceName()

  return licenceName ?? null
}

function _notification(licence) {
  const { includeInPresrocBilling, includeInSrocBilling, licenceSupplementaryYears } = licence
  const baseMessage = 'This licence has been marked for the next '

  if (licenceSupplementaryYears.length > 0) {
    return _tptNotification(baseMessage, includeInPresrocBilling, includeInSrocBilling)
  }

  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return baseMessage + 'supplementary bill runs for the current and old charge schemes.'
  }
  if (includeInPresrocBilling === 'yes') {
    return baseMessage + 'supplementary bill run for the old charge scheme.'
  }

  if (includeInSrocBilling === true) {
    return baseMessage + 'supplementary bill run.'
  }

  return null
}

function _tptNotification(baseMessage, includeInPresrocBilling, includeInSrocBilling) {
  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return (
      baseMessage +
      'two-part tariff supplementary bill run and supplementary bill runs for the current and old charge schemes.'
    )
  }
  if (includeInPresrocBilling === 'yes') {
    return (
      baseMessage + 'two-part tariff supplementary bill run and the supplementary bill run for the old charge scheme.'
    )
  }

  if (includeInSrocBilling === true) {
    return baseMessage + 'two-part tariff supplementary bill run and the supplementary bill run.'
  }

  return baseMessage + 'two-part tariff supplementary bill run.'
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
