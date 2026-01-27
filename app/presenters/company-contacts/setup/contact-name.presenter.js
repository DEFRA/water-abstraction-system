'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-name' page
 * @module ContactNamePresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { company } = session

  return {
    backLink: {
      href: `/system/companies/${company.id}/contacts`,
      text: 'Back'
    },
    pageTitle: 'Enter a name for the contact',
    pageTitleCaption: company.name,
    name: session.name ?? ''
  }
}

module.exports = {
  go
}
