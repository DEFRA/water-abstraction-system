'use strict'

/**
 * Formats data for the '/companies/{id}/licences' page
 * @module LicencesPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the '/companies/{id}/licences' page
 *
 * @param {module:CompanyModel} company - The company from the companies table
 * @param {object} licences - the licences for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, licences) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitleCaption: company.name,
    pageTitle: 'Licences',
    licenceRoles: _licenceRoles(licences)
  }
}

function _licenceRoles(licences) {
  const licenceRoles = []

  for (const licence of licences) {
    const licenceEndDetails = licence.$ends()

    const { licenceDocumentRoles } = licence.licenceDocument

    for (const licenceDocumentRole of licenceDocumentRoles) {
      const { endDate, licenceRole: role, startDate } = licenceDocumentRole

      const licenceRoleDetails = {
        communicationType: role.label,
        endDate: formatLongDate(endDate),
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        licenceRoleCount: licenceDocumentRoles.length,
        startDate: formatLongDate(startDate),
        status: licenceEndDetails.status
      }

      licenceRoles.push(licenceRoleDetails)
    }
  }

  return licenceRoles
}

module.exports = {
  go
}
