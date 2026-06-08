'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/licences' page
 * @module LicencesPresenter
 */

const { checkUrl } = require('../../../lib/check-page.lib.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/company-contacts/setup/${sessionId}/abstraction-alerts`),
      text: 'Back'
    },
    pageTitle: 'Select the licences they should get water abstraction alerts emails for'
  }
}

module.exports = {
  go
}
