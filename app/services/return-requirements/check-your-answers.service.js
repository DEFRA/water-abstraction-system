'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersService
 */

const CheckYourAnswersPresenter = require('../../presenters/return-requirements/check-your-answers.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check-your-answers` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckYourAnswersVisited(session)

  const formattedData = CheckYourAnswersPresenter.go(session)

  const notification = yar.flash('notification')[0]

  return {
    activeNavBar: 'search',
    notification,
    ...formattedData
  }
}

async function _markCheckYourAnswersVisited (session) {
  session.checkYourAnswersVisited = true

  return session.$update()
}

module.exports = {
  go
}
