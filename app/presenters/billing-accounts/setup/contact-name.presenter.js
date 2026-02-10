'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact-name` page
 * @module ContactNamePresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact-name` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/contact`,
      text: 'Back'
    },
    contactName: session.contactName ?? null,
    pageTitle: 'Enter a name for the contact',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

module.exports = {
  go
}
