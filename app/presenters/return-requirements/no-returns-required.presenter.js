'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: _backLink(session),
    licenceRef: licence.licenceRef,
    reason: reason || null,
    sessionId
  }
}

function _backLink (session) {
  const { checkYourAnswersVisited, id } = session

  if (checkYourAnswersVisited) {
    return `/system/return-requirements/${id}/check-your-answers`
  }

  return `/system/return-requirements/${id}/start-date`
}

module.exports = {
  go
}
