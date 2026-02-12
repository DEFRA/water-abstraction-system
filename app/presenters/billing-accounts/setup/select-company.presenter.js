'use strict'

/**
 * Formats data for the '/billing-accounts/setup/{sessionId}/select-company' page
 * @module SelectCompanyPresenter
 */

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
      href: `/system/billing-accounts/setup/${session.id}/company-search`,
      text: 'Back'
    },
    companies: _radioOptions(companies, session.companiesHouseId),
    companiesHouseId: session.companiesHouseId ?? null,
    pageTitle: 'Select the registered company details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _radioOptions(companies, companiesHouseId) {
  const items = []

  for (const company of companies) {
    items.push({
      id: company.companiesHouseId,
      text: company.address,
      value: company.companiesHouseId,
      checked: company.companiesHouseId === companiesHouseId
    })
  }

  return items
}

module.exports = {
  go
}
