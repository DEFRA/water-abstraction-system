'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module ViewContactService
 */

const ContactPresenter = require('../../../presenters/billing-accounts/setup/contact.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ContactPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
