'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
 * @module CancelPresenter
 */

const { titleCase } = require('../../base.presenter.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { company, email, name, abstractionAlerts } = session

  return {
    backLink: {
      href: `/system/company-contacts/setup/${session.id}/check`,
      text: 'Back'
    },
    abstractionAlerts: titleCase(abstractionAlerts),
    email,
    name,
    pageTitle: _pageTitle(session),
    pageTitleCaption: company.name
  }
}

function _pageTitle(session) {
  if (session.companyContact) {
    return 'You are about to cancel editing this contact'
  }

  return 'You are about to cancel this contact'
}

module.exports = {
  go
}
