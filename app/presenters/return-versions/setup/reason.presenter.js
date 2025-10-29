'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 * @module ReasonPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: { href: _backLinkHref(session), text: 'Back' },
    licenceRef: licence.licenceRef,
    pageTitle: 'Select the reason for the requirements for returns',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    reason: reason ?? null,
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
