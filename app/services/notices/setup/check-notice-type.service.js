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
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckPageVisited(session)

  const pageData = CheckNoticeTypePresenter.go(session)

  const notification = yar.flash('notification')[0]

  return {
    ...pageData,
    activeNavBar: 'notices',
    notification
  }
}

async function _markCheckPageVisited(session) {
  session.checkPageVisited = true

  return session.$update()
}

module.exports = {
  go
}
