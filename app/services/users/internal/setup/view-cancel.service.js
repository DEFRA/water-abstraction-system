'use strict'

/**
 * Orchestrates presenting the data for `/users/internal/setup/{sessionId}/cancel` page
 * @module ViewCancelService
 */

const CancelPresenter = require('../../../../presenters/users/internal/setup/cancel.presenter.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates presenting the data for `/users/internal/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the cancel page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = CancelPresenter.go(session)

  return pageData
}

module.exports = {
  go
}
