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
    backLink: {
      href: _backLink(session),
      text: 'Back'
    },
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _backLink(session) {
  const { id } = session

  if (session.fao === 'no') {
    return `/system/billing-accounts/setup/${id}/fao`
  }

  return `/system/billing-accounts/setup/${id}/select-contact`
}

module.exports = {
  go
}
