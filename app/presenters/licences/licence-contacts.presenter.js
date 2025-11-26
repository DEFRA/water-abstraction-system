'use strict'

/**
 * Formats data for the `/licences/{id}/licence-contact` licence contact details link page
 * @module LicenceContactsPresenter
 */

const { filteredContactDetailsByRole } = require('../crm.presenter.js')

const ENTITY_ROLES = {
  primary_user: 'Primary user',
  user_returns: 'Returns agent'
}

/**
 * Formats data for the `/licences/{id}/licence-contact` licence contact details link page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceDocumentHeader
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence) {
  const { id: licenceId, licenceDocumentHeader, licenceRef } = licence

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to summary'
    },
    licenceContactDetails: _licenceContactDetails(licenceDocumentHeader),
    pageTitle: 'Licence contact details',
    pageTitleCaption: `Licence ${licenceRef}`
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
      role: ENTITY_ROLES[licenceEntityRole.role],
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
