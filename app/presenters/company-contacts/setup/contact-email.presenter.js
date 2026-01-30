'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 * @module ContactEmailPresenter
 */

const { checkBackLink } = require('../../../services/company-contacts/setup/spike.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, company } = session

  const backLink = {
    href: `/system/company-contacts/setup/${sessionId}/contact-name`,
    text: 'Back'
  }

  return {
    backLink: checkBackLink(session, backLink),
    pageTitle: 'Enter an email address for the contact',
    pageTitleCaption: company.name,
    email: session.email ?? ''
  }
}

module.exports = {
  go
}
