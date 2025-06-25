'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @module CheckNoticeTypeService
 */

const CheckNoticeTypePresenter = require('../../../presenters/notices/setup/check-notice-type.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckNoticeTypePresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
