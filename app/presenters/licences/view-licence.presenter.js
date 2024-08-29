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
function go (licence, auth) {
  const {
    id,
    licenceDocumentHeader,
    licenceRef,
    workflows
  } = licence

  const primaryUser = licence.$primaryUser()

  return {
    documentId: licenceDocumentHeader.id,
    licenceId: id,
    licenceName: _licenceName(licence),
    licenceRef,
    notification: _notification(licence),
    pageTitle: `Licence ${licenceRef}`,
    primaryUser,
    roles: _roles(auth),
    warning: _warning(licence),
    workflowWarning: _workflowWarning(workflows)
  }
}

function _licenceName (licence) {
  const licenceName = licence.$licenceName()

  if (licenceName) {
    return licenceName
  }

  return 'Unregistered licence'
}

function _notification (licence) {
  const { includeInPresrocBilling, includeInSrocBilling } = licence
  const baseMessage = 'This licence has been marked for the next supplementary bill run'

  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return baseMessage + 's for the current and old charge schemes.'
  }
  if (includeInPresrocBilling === 'yes') {
    return baseMessage + ' for the old charge scheme.'
  }

  if (includeInSrocBilling === true) {
    return baseMessage + '.'
  }

  return null
}

function _roles (auth) {
  return auth.credentials.roles.map((role) => {
    return role.role
  })
}

function _warning (licence) {
  const today = new Date()
  const ends = licence.$ends()

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

function _workflowWarning (workflows) {
  return workflows.some((workflow) => {
    return workflow.status === 'to_setup'
  })
}

module.exports = {
  go
}
