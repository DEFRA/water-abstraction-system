'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 * @module AbstractionAlertsPresenter
 */

const { checkBackLink } = require('../../../services/company-contacts/setup/spike.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, company } = session

  const backLink = {
    href: `/system/company-contacts/setup/${sessionId}/contact-email`,
    text: 'Back'
  }

  return {
    backLink: checkBackLink(session, backLink),
    pageTitle: 'Should the contact get abstraction alerts?',
    pageTitleCaption: company.name,
    abstractionAlerts: session.abstractionAlerts ?? null
  }
}

module.exports = {
  go
}
