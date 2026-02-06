'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/fao` page
 * @module FAOPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    backLink: {
      href: _backLink(session),
      text: 'Back'
    },
    fao: session.fao ?? null,
    pageTitle: 'Do you need to add an FAO?',
    pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
  }
}

function _backLink(session) {
  const address = session?.addressJourney?.address || {}

  if (address.uprn) {
    return `/system/address/${session.id}/select`
  }

  if (address.postcode) {
    return `/system/address/${session.id}/manual`
  }

  if (address.country) {
    return `/system/address/${session.id}/international`
  }

  return `/system/billing-accounts/setup/${session.id}/existing-address`
}

module.exports = {
  go
}
