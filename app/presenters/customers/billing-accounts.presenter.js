'use strict'

/**
 * Formats data for the 'customers/{id}/billing-accounts' page
 * @module BillingAccountsPresenter
 */

const { titleCase } = require('../base.presenter.js')

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
      address: _address(billingAccount),
      link: `/system/billing-accounts/${billingAccount.id}?company-id=${billingAccount.company.id}`
    }
  })
}

/**
 * Formats a billing account's address for display on the view billing account page.
 *
 * Some billing accounts will have a different company linked to them via the billing account address, then the primary
 * company against the billing account itself. This happens if a user opts to set a different company that the bills
 * should be sent to. So we have to handle this when determining the 'company name'.
 *
 * Also, some billing accounts may have fewer populated address lines than others, resulting in `null` values. This
 * function filters out any empty address lines, applies title casing to each one, and appends the postcode in
 * uppercase.
 *
 * @private
 */
function _address(billingAccount) {
  const {
    billingAccountAddresses: [billingAccountAddress],
    company: primaryCompany
  } = billingAccount

  const { address, company, contact } = billingAccountAddress

  const contactName = contact ? `FAO ${contact.$name()}` : null
  const addressCompanyName = company ? company.name : primaryCompany.name

  const companyName = titleCase(addressCompanyName)

  const addressLines = [
    address['address1'],
    address['address2'],
    address['address3'],
    address['address4'],
    address['address5'],
    address['address6']
  ]
    .filter(Boolean)
    .map(titleCase)

  if (address['postcode']) {
    addressLines.push(address['postcode'].toUpperCase())
  }

  return [companyName, contactName, ...addressLines].filter(Boolean)
}

module.exports = {
  go
}
