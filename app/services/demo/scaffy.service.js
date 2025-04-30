'use strict'

/**
 * Orchestrates presenting the data for `` page
 *
 * @module ScaffyService
 */

const ScaffyPresenter = require('../../presenters/demo/scaffy.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates presenting the data for `` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ScaffyPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
