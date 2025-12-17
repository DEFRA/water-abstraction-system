'use strict'

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 * @module BillingAccountsPresenter
 */

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitle: 'Billing accounts'
  }
}

module.exports = {
  go
}
