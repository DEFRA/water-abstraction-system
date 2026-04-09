'use strict'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 * @module ViewCancelService
 */

const CancelPresenter = require('../../../presenters/notices/setup/cancel.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notice setup session record
 *
 * @returns {Promise<object>} The view data for the cancel page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

module.exports = {
  go
}
