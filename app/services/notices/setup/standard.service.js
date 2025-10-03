'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/standard` page
 *
 * @module StandardService
 */

const StandardPresenter = require('../../../presenters/notices/setup/standard.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/standard` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = StandardPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
