'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 * @module ExistingAccountPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 * @param {module:CompanyModel[]} companies - The companies returned from the fetch service
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companies) {
  const { billingAccount } = session

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/account`,
      text: 'Back'
    },
    items: _radioOptions(session.existingAccount, companies),
    pageTitle: _pageTitle(session, companies),
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _pageTitle(session, companies) {
  if (companies.length === 0) {
    return `No search results found for "${session.searchInput}"`
  }

  return 'Does this account already exist?'
}

function _radioOptions(existingAccount, companies) {
  if (companies.length === 0) {
    return []
  }

  const items = []

  for (const company of companies) {
    items.push({
      id: company.id,
      value: company.id,
      text: company.name,
      checked: existingAccount === company.id
    })
  }

  items.push(
    {
      divider: 'or'
    },
    {
      id: 'new',
      value: 'new',
      text: 'Setup a new account',
      checked: existingAccount === 'new'
    }
  )

  return items
}

module.exports = {
  go
}
