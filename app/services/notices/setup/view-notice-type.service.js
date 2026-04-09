'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module ViewNoticeTypeService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const NoticeTypePresenter = require('../../../presenters/notices/setup/notice-type.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {string} sessionId
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, auth) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = NoticeTypePresenter.go(session, auth)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

module.exports = {
  go
}
