'use strict'

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 * @module BillingAccountsPresenter
 */

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 * @param {object} billingAccounts - the billing accounts for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer, billingAccounts) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    billingAccounts: _billingAccounts(billingAccounts),
    pageTitle: 'Billing accounts',
    pageTitleCaption: customer.name
  }
}

function _billingAccounts(billingAccounts) {
  return billingAccounts.map((billingAccount) => {
    return {
      accountNumber: billingAccount.accountNumber,
      address: billingAccount.$displayAddress(),
      link: `/system/billing-accounts/${billingAccount.id}?company-id=${billingAccount.company.id}`
    }
  })
}

module.exports = {
  go
}
