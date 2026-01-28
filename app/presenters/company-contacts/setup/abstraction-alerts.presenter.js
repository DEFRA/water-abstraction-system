'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 * @module AbstractionAlertsPresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
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
