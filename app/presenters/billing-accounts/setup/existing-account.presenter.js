'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 * @module ExistingAccountPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-account` page
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
    items: _radioOptions(session.existingAccount),
    pageTitle: 'Does this account already exist?',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _radioOptions(existingAccount) {
  const items = []

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
