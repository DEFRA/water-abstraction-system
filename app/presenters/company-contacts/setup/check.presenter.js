'use strict'

/**
 * Formats data for the the '/company-contacts/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

/**
 * Formats data for the the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: ''
  }
}

module.exports = {
  go
}
