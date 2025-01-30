'use strict'

const { filteredContactDetailsByRole } = require('../crm.presenter.js')

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactDetailsPresenter
 */

const ROLES = {
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
    ..._licenceEntityRole(licenceDocumentHeader.licenceEntityRole)
  ]
}

function _licenceEntityRole(licenceEntityRole) {
  return licenceEntityRole.map(_licenceEntity).sort(_sortLicenceEntity)
}

function _licenceEntity(entity) {
  return {
    role: ROLES[entity.role],
    email: entity.licenceEntity.name
  }
}

function _sortLicenceEntity(a, b) {
  if (a.role < b.role) {
    return -1
  }
  if (a.role > b.role) {
    return 1
  }
  return 0
}

module.exports = {
  go
}
