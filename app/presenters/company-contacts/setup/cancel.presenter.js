'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
 * @module CancelPresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
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
