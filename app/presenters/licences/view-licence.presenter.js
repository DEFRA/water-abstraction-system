'use strict'

/**
 * Formats data for common licence data `/licences/{id}` page's
 * @module ViewLicencePresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for common licence data `/licences/{id}` page's
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence, auth) {
  const {
    ends,
    id,
    includeInPresrocBilling,
    includeInSrocBilling,
    licenceDocumentHeader,
    licenceName,
    licenceRef,
    registeredTo,
    workflows
  } = licence

  return {
    activeNavBar: 'search',
    documentId: licenceDocumentHeader.id,
    ends,
    includeInPresrocBilling,
    licenceId: id,
    licenceName,
    licenceRef,
    notification: _determineNotificationBanner(includeInPresrocBilling, includeInSrocBilling),
    pageTitle: `Licence ${licenceRef}`,
    registeredTo,
    roles: _authRoles(auth),
    warning: _generateWarningMessage(ends),
    workflowWarning: _generateWorkflowWarningMessage(workflows)
  }
}

function _determineNotificationBanner (includeInPresrocBilling, includeInSrocBilling) {
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

function _authRoles (auth) {
  const roles = auth?.credentials?.roles?.map((role) => {
    return role?.role
  })

  return roles || null
}

function _generateWarningMessage (ends) {
  if (!ends) {
    return null
  }

  const { date, reason } = ends
  const today = new Date()

  if (date > today) {
    return null
  }

  if (reason === 'revoked') {
    return `This licence was revoked on ${formatLongDate(date)}`
  }

  if (reason === 'lapsed') {
    return `This licence lapsed on ${formatLongDate(date)}`
  }

  return `This licence expired on ${formatLongDate(date)}`
}

function _generateWorkflowWarningMessage (workflows) {
  return workflows.some((workflow) => {
    return workflow.status === 'to_setup'
  })
}

module.exports = {
  go
}
