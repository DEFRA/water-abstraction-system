'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected === 'customer' ? billingAccount.company.name : 'Another billing account',
    links: _links(session),
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchInput: session.searchInput ?? ''
  }
}

function _links(session) {
  return {
    accountSelected: `/system/billing-accounts/setup/${session.id}/account`
  }
}

module.exports = {
  go
}
