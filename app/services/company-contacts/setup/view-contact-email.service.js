'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @module ViewContactEmailService
 */

const ContactEmailPresenter = require('../../../presenters/company-contacts/setup/contact-email.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = ContactEmailPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
