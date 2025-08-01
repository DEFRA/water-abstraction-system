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
    pageTitle: 'Enter a UK postcode',
    postcode: session?.address?.postcode ?? null
  }
}

function _backLink(session) {
  if (session.contactType) {
    return `/system/notices/setup/${session.id}/select-recipients`
  }

  return `/system/address/${session.id}/postcode`
}

module.exports = {
  go
}
