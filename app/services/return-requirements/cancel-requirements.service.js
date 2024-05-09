'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/cancel-requirements` page
 * @module CancelRequirementsService
 */

const CancelRequirementsPresenter = require('../../presenters/return-requirements/cancel-requirements.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/cancel-requirements` page
 *
 * Supports generating the data needed for the cancel requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<Object>} The view data for the cancel requirements page
*/
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = CancelRequirementsPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'You are about to cancel these requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
