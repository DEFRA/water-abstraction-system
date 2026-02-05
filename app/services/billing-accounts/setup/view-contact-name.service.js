'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/contact-name` page
 *
 * @module ViewContactNameService
 */

const ContactNamePresenter = require('../../../presenters/billing-accounts/setup/contact-name.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/contact-name` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ContactNamePresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
