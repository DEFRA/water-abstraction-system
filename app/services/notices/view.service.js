'use strict'

/**
 * Orchestrates presenting the data for the `` page
 *
 * @module ViewService
 */

const ViewPresenter = require('../../presenters/notices/view.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates presenting the data for the `` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ViewPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
