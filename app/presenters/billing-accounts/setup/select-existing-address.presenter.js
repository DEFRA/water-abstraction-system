'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 * @module SelectExistingAddressPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/select-account`,
      text: 'Back'
    },
    pageTitle: `Select an existing address for ${billingAccount.company.name}`,
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

module.exports = {
  go
}
