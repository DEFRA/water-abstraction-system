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
    backLink: _backLink(session),
    licenceRef: licence.licenceRef,
    reason: reason || null,
    pageTitle: 'Why are no returns required?',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session
  let backLink

  if (checkPageVisited) {
    backLink = `/system/return-versions/setup/${id}/check`
  } else {
    backLink = `/system/return-versions/setup/${id}/start-date`
  }

  return {
    href: backLink,
    text: 'Back'
  }
}

module.exports = {
  go
}
