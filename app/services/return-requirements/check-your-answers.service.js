'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersService
 *
 * @param {string} id - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
const CheckYourAnswersPresenter = require('../../presenters/return-requirements/check-your-answers.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = CheckYourAnswersPresenter.go(session)

  return {
    activeNavBar: 'search',
    licence_id: session.data.licence.licenceRef,
    pageTitle: `Check the return requirements for ${session.data.licence.licenceHolder}`,
    ...formattedData
  }
}

module.exports = {
  go
}
