'use strict'

/**
 * Formats data for the `address/{sessionId}/postcode` page
 * @module PostcodePresenter
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
 * The address lookup can support multiple journeys; we need a mechanism to redirect the user back to the previous page
 * when they are on this generic journey.
 *
 * We achieve this by having the previous page provide the backlink in the session.
 *
 * The default return to the postcode page is a placeholder until the address lookup journey is expanded.
 *
 * @private
 */
function _backLink(session) {
  if (session.address.backLink) {
    return session.address.backLink.href
  }

  return `/system/address/${session.id}/postcode`
}

module.exports = {
  go
}
