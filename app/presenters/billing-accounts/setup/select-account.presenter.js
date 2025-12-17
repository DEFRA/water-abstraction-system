'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 * @module SelectAccountPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected ?? null,
    companyName: billingAccount.company.name,
    backLink: {
      href: `/system/billing-accounts/${billingAccount.id}`,
      text: 'Back'
    },
    pageTitle: 'Who should the bills go to?',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

module.exports = {
  go
}
