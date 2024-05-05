'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersService
 */

const CheckYourAnswersPresenter = require('../../presenters/return-requirements/check-your-answers.presenter.js')
const FetchSessionService = require('./fetch-session.service.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check-your-answers` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId, yar) {
  const session = await FetchSessionService.go(sessionId)

  const notification = yar.flash('notification')[0]
  const formattedData = CheckYourAnswersPresenter.go(session)

  await _checkYourAnswersVisited(session)

  return {
    activeNavBar: 'search',
    notification,
    licenceRef: session.licence.licenceRef,
    pageTitle: `Check the return requirements for ${session.licence.licenceHolder}`,
    ...formattedData
  }
}

async function _checkYourAnswersVisited (session) {
  session.checkYourAnswersVisited = true

  return session.update()
}

module.exports = {
  go
}
