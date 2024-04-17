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
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId, user) {
  const session = await SessionModel.query().findById(sessionId)
  const { username: userEmail } = user

  const formattedData = CheckYourAnswersPresenter.go(session)

  await _checkYourAnswersVisited(session)

  return {
    activeNavBar: 'search',
    licenceRef: session.data.licence.licenceRef,
    pageTitle: `Check the return requirements for ${session.data.licence.licenceHolder}`,
    userEmail,
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
