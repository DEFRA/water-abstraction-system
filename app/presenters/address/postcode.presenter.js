'use strict'

/**
 * Formats data for the `address/{sessionId}/postcode` page
 * @module PostcodeAddressPresenter
 */

/**
 * Formats data for the `address/{sessionId}/postcode` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { addressJourney, id } = session

  return {
    activeNavBar: addressJourney.activeNavBar,
    backLink: addressJourney.backLink,
    internationalLink: `/system/address/${id}/international`,
    pageTitle: 'Enter a UK postcode',
    pageTitleCaption: addressJourney.pageTitleCaption ?? null,
    postcode: addressJourney.address?.postcode ?? null
  }
}

module.exports = {
  go
}
