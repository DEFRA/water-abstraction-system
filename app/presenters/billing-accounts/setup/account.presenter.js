'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/account` page
 * @module AccountPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/account` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected ?? null,
    companyId: billingAccount.company.id,
    companyName: billingAccount.company.name,
    backLink: {
      href: _backLink(session),
      text: 'Back'
    },
    pageTitle: 'Who should the bills go to?',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchInput: session.searchInput ?? null
  }
}

function _backLink(session) {
  if (session.checkPageVisited) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  return `/system/billing-accounts/${session.billingAccount.id}`
}

module.exports = {
  go
}
