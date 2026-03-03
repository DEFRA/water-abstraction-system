'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 * @module AccountTypePresenter
 */

const { checkUrl } = require('../../../lib/check-page.lib.js')

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    accountType: session.accountType ?? null,
    backLink: {
      href: checkUrl(session, `/system/billing-accounts/setup/${session.id}/existing-account`),
      text: 'Back'
    },
    pageTitle: 'Select the account type',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchIndividualInput: session.searchIndividualInput ?? null
  }
}

module.exports = {
  go
}
