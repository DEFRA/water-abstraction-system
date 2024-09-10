'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 * @module CheckService
 */

const CheckPresenter = require('../../presenters/return-requirements/check.presenter.js')
const FetchPointsService = require('./fetch-points.service.js')
const ReturnRequirementsPresenter = require('../../presenters/return-requirements/check/returns-requirements.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go (sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckPageVisited(session)

  const returnRequirements = await _returnRequirements(session)

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

async function _returnRequirements (session) {
  const { licence, requirements, journey } = session

  const licenceVersionPurposePoints = await FetchPointsService.go(licence.id)

  return ReturnRequirementsPresenter.go(requirements, licenceVersionPurposePoints, journey)
}

module.exports = {
  go
}
