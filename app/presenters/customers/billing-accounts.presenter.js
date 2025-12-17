'use strict'

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 * @module BillingAccountsPresenter
 */

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
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
    pageTitle: 'Billing accounts',
    pageTitleCaption: customer.name
  }
}

module.exports = {
  go
}
