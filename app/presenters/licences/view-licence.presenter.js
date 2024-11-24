'use strict'

/**
 * Formats data for common licence data `/licences/{id}` pages
 * @module ViewLicencePresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for common licence data `/licences/{id}` page's
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence, auth) {
  const { id, includeInPresrocBilling, licenceDocumentHeader, licenceRef, workflows } = licence

  const primaryUser = licence.$primaryUser()
  const ends = licence.$ends()

  return {
    documentId: licenceDocumentHeader.id,
    ends,
    includeInPresrocBilling,
    licenceId: id,
    licenceName: _licenceName(primaryUser, licence),
    licenceRef,
    notification: _notification(licence),
    pageTitle: `Licence ${licenceRef}`,
    primaryUser,
    roles: _roles(auth),
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

function _roles(auth) {
  return auth.credentials.roles.map((role) => {
    return role.role
  })
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
  const today = new Date()

  if (!ends || ends.date > today) {
    return null
  }

  const formattedDate = formatLongDate(ends.date)

  if (ends.reason === 'revoked') {
    return `This licence was revoked on ${formattedDate}`
  }

  if (ends.reason === 'lapsed') {
    return `This licence lapsed on ${formattedDate}`
  }

  return `This licence expired on ${formattedDate}`
}

function _workflowWarning(workflows) {
  return workflows.some((workflow) => {
    return workflow.status === 'to_setup'
  })
}

module.exports = {
  go
}
