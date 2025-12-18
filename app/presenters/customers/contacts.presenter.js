'use strict'

/**
 * Formats data for the 'customers/{id}/contacts' page
 * @module ContactsPresenter
 */

/**
 * Formats data for the 'customers/{id}/contacts' page
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
    pageTitle: 'Contacts',
    pageTitleCaption: customer.name
  }
}

module.exports = {
  go
}
