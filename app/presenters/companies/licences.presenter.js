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
    licences: _licences(licences)
  }
}

function _licences(licences) {
  return licences.map((licence) => {
    return {
      startDate: formatLongDate(licence.startDate),
      endDate: formatLongDate(licence.endDate),
      licenceRef: licence.licenceRef,
      licenceName: licence.$licenceName(),
      id: licence.id
    }
  })
}

module.exports = {
  go
}
