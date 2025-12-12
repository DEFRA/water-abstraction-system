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
  const { billingAccountId } = session

  return {
    backLink: {
      href: `/billing-accounts/${billingAccountId}`,
      text: 'Back'
    },
    pageTitle: 'Who should the bills go to?'
  }
}

module.exports = {
  go
}
