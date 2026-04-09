'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @module ViewPaperReturnService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const PaperReturnPresenter = require('../../../presenters/notices/setup/paper-return.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = PaperReturnPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

module.exports = {
  go
}
