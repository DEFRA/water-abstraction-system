'use strict'

const { filteredContactDetailsByRole } = require('../crm.presenter.js')

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactDetailsPresenter
 */

const ENTITY_ROLES = {
  primary_user: 'Primary user',
  user_returns: 'Returns agent'
}

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceDocumentHeader
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence) {
  const { id: licenceId, licenceDocumentHeader, licenceRef } = licence

  return {
    licenceId,
    licenceRef,
    licenceContactDetails: _licenceContactDetails(licenceDocumentHeader),
    pageTitle: 'Licence contact details'
  }
}

function _licenceContactDetails(licenceDocumentHeader) {
  return [
    ...filteredContactDetailsByRole(licenceDocumentHeader.metadata.contacts),
    ..._licenceEntityRoles(licenceDocumentHeader.licenceEntityRoles)
  ]
}

function _formatLicenceEntityRoles(licenceEntityRoles) {
  return licenceEntityRoles.map((licenceEntityRole) => {
    return {
      role: ROLES[licenceEntityRole.role],
      email: licenceEntityRole.licenceEntity.name
    }
  })
}

function _licenceEntityRoles(licenceEntityRoles) {
  const formattedLicenceEntityRoles = _formatLicenceEntityRoles(licenceEntityRoles)

  return _sortLicenceEntityRoles(formattedLicenceEntityRoles)
}

function _sortLicenceEntityRoles(licenceEntityRoles) {
  return licenceEntityRoles.sort((a, b) => {
    if (a.role < b.role) {
      return -1
    }

    if (a.role > b.role) {
      return 1
    }

    return 0
  })
}

module.exports = {
  go
}
