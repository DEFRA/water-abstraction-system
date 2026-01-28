'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 * @module ContactEmailPresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, company } = session

  return {
    backLink: {
      href: `/system/company-contacts/setup/${sessionId}/contact-name`,
      text: 'Back'
    },
    pageTitle: 'Enter an email address for the contact',
    pageTitleCaption: company.name,
    email: session.email ?? ''
  }
}

module.exports = {
  go
}
