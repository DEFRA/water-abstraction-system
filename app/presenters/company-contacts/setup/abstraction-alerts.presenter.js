'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 * @module AbstractionAlertsPresenter
 */

const { checkUrl } = require('../../../lib/check-page.lib.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, company } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/company-contacts/setup/${sessionId}/contact-email`),
      text: 'Back'
    },
    pageTitle: 'Should the contact get abstraction alerts?',
    pageTitleCaption: company.name,
    abstractionAlerts: session.abstractionAlerts ?? null
  }
}

module.exports = {
  go
}
