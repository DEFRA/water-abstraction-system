'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/no-returns-required` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: { href: _backLinkHref(session), text: 'Back' },
    licenceRef: licence.licenceRef,
    reason: reason || null,
    pageTitle: 'Why are no returns required?',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLinkHref(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  }

  return `/system/return-versions/setup/${id}/start-date`
}

module.exports = {
  go
}
