'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

const { titleCase } = require('../../base.presenter.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { company, email, name, abstractionAlerts } = session

  return {
    abstractionAlerts: titleCase(abstractionAlerts),
    email,
    name,
    pageTitle: 'Check contact',
    pageTitleCaption: company.name,
    links: {
      abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
      cancel: `/system/company-contacts/setup/${session.id}/cancel`,
      email: `/system/company-contacts/setup/${session.id}/contact-email`,
      name: `/system/company-contacts/setup/${session.id}/contact-name`
    }
  }
}

module.exports = {
  go
}
