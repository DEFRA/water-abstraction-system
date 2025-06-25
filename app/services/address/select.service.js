'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @module SelectService
 */

const SelectPresenter = require('../../presenters/address/select.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = SelectPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
