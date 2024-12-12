'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/cancel` page
 * @module CancelService
 */

const CancelPresenter = require('../../../presenters/return-versions/setup/cancel.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/cancel` page
 *
 * Supports generating the data needed for the cancel requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the cancel requirements page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'You are about to cancel these requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
