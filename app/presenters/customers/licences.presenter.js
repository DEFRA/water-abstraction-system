'use strict'

/**
 * Formats data for the 'customers/{id}/licences' page
 * @module LicencesPresenter
 */

/**
 * Formats data for the 'customers/{id}/licences' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitleCaption: customer.name,
    pageTitle: 'Licences'
  }
}

module.exports = {
  go
}
