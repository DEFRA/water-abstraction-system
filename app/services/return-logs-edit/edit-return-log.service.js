'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 * @module EditReturnLogService
 */

const SessionModel = require('../../models/session.model.js')
const EditReturnLogPresenter = require('../../presenters/return-logs-edit/edit-return-log.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return EditReturnLogPresenter.go(session)
}

module.exports = {
  go
}
