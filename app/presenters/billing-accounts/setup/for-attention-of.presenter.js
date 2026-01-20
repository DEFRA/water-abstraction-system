'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/for-attention-of` page
 * @module ForAttentionOfPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/for-attention-of` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/select-existing-address`,
      text: 'Back'
    },
    forAttentionOf: session.forAttentionOf ?? null,
    pageTitle: 'Do you need to add an FAO?',
    pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
  }
}

module.exports = {
  go
}
