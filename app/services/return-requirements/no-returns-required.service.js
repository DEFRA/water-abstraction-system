'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredService
 */
const NoReturnsRequiredPresenter = require('../../presenters/return-requirements/no-returns-required.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId, error = null) {
  const session = await SessionModel.query().findById(sessionId)
  const pageData = NoReturnsRequiredPresenter.go(session, error)

  return pageData
}

module.exports = {
  go
}
