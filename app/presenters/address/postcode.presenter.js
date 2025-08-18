'use strict'

/**
 * Formats data for the `address/{sessionId}/postcode` page
 * @module ManualAddressPresenter
 */

/**
 * Formats data for the `address/{sessionId}/postcode` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    backLink: _backLink(session),
    internationalLink: `/system/address/${session.id}/international`,
    pageTitle: 'Enter a UK postcode',
    postcode: session?.address?.postcode ?? null
  }
}

/**
 * The address lookup journey currently only supports ad-hoc notice journey so we return to the contact-type page for
 * that journey. The default return to the postcode page is a placeholder until the address lookup journey is expanded.
 *
 * @private
 */
function _backLink(session) {
  if (session.contactName) {
    return `/system/notices/setup/${session.id}/contact-type`
  }

  return `/system/address/${session.id}/postcode`
}

module.exports = {
  go
}
