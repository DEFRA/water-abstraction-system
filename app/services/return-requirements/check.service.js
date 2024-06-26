'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 * @module CheckService
 */

const CheckPresenter = require('../../presenters/return-requirements/check.presenter.js')
const ReturnRequirementsService = require('./check/returns-requirements.service.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckPageVisited(session)

  const returnRequirements = await ReturnRequirementsService.go(session)

  const formattedData = CheckPresenter.go(session)

  const notification = yar.flash('notification')[0]

  return {
    activeNavBar: 'search',
    notification,
    ...returnRequirements,
    ...formattedData
  }
}

async function _markCheckPageVisited (session) {
  session.checkPageVisited = true

  return session.$update()
}

module.exports = {
  go
}
