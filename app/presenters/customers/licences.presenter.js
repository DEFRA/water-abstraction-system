'use strict'

/**
 * Formats data for the 'customers/{id}/licences' page
 * @module LicencesPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the 'customers/{id}/licences' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 * @param {object} licenceDocumentRoles - the licences document roles for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer, licenceDocumentRoles) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitleCaption: customer.name,
    pageTitle: 'Licences',
    licences: _licences(licenceDocumentRoles)
  }
}

function _licences(licences) {
  return licences.map((licence) => {
    return {
      startDate: formatLongDate(licence.licenceDocument.startDate),
      endDate: formatLongDate(licence.licenceDocument.endDate),
      licenceRef: licence.licenceDocument.licence.licenceRef,
      licenceName: licence.licenceDocument.licence.$licenceName(),
      id: licence.licenceDocument.licence.id
    }
  })
}

module.exports = {
  go
}
