'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 * @module ContactPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/fao`,
      text: 'Back'
    },
    contactSelected: session.contactSelected ?? null,
    pageTitle: `Set up a contact for ${billingAccount.company.name}`,
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

module.exports = {
  go
}
