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

  const notification = yar.flash('notification')[0]
  const formattedData = CheckYourAnswersPresenter.go(session)

  await _checkYourAnswersVisited(session)

  return {
    activeNavBar: 'search',
    notification,
    licenceRef: session.data.licence.licenceRef,
    pageTitle: `Check the return requirements for ${session.data.licence.licenceHolder}`,
    ...formattedData
  }
}

async function _checkYourAnswersVisited (session) {
  const currentData = session.data

  currentData.checkYourAnswersVisited = true
  await session.$query().patch({ data: currentData })

  const updatedSession = await SessionModel.query().findById(session.id)
  return updatedSession
}

module.exports = {
  go
}
