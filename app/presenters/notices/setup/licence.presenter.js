'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/licence` page
 * @module LicencePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/licence` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { checkPageVisited, id: sessionId, licenceRef } = session

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    licenceRef: licenceRef || null,
    pageTitle: 'Enter a licence number'
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return {
      href: `/system/notices/setup/${sessionId}/check-notice-type`,
      text: 'Back'
    }
  }

  return {
    href: '/system/notices',
    text: 'Back'
  }
}

module.exports = {
  go
}
