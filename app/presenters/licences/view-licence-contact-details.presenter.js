'use strict'

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactDetailsPresenter
 */

const CRMContactPresenter = require('../crm-contact.presenter.js')

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
    licenceContactDetails: CRMContactPresenter.go(licenceDocumentHeader.metadata.contacts),
    pageTitle: 'Licence contact details'
  }
}

module.exports = {
  go
}
