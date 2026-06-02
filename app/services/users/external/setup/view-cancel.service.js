'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @module ViewCancelService
 */

const CancelPresenter = require('../../../../presenters/users/external/setup/cancel.presenter.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = CancelPresenter.go(session)

  return pageData
}

module.exports = {
  go
}
