'use strict'

/**
 * Formats data for the '/billing-accounts/setup/{sessionId}/select-company' page
 * @module SelectCompanyPresenter
 */

const { checkUrl } = require('../../../lib/check-page.lib.js')

/**
 * Formats data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @param {object} session - The session instance
 * @param {object[]} companies - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companies) {
  const { billingAccount } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/billing-accounts/setup/${session.id}/company-search`),
      text: 'Back'
    },
    companies: _radioOptions(companies, session.companiesHouseNumber),
    companiesHouseNumber: session.companiesHouseNumber ?? null,
    pageTitle: 'Select the registered company details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _radioOptions(companies, companiesHouseNumber) {
  const items = []

  for (const company of companies) {
    items.push({
      id: company.number,
      hint: {
        text: company.address
      },
      text: company.title,
      value: company.number,
      checked: company.number === companiesHouseNumber
    })
  }

  return items
}

module.exports = {
  go
}
