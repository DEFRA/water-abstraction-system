'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/ad-hoc/select-notice-type` page
 *
 * @module SelectNoticeTypeService
 */

const SelectNoticeTypePresenter = require('../../../../presenters/notices/setup/ad-hoc/select-notice-type.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/ad-hoc/select-notice-type` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = SelectNoticeTypePresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
