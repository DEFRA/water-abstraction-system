'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module NoticeTypeService
 */

const NoticeTypePresenter = require('../../../presenters/notices/setup/notice-type.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {string} sessionId
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = NoticeTypePresenter.go(session, auth)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
