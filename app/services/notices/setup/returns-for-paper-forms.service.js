'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @module ReturnsForPaperFormsService
 */

const ReturnsForPaperFormsPresenter = require('../../../presenters/notices/setup/returns-for-paper-forms.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ReturnsForPaperFormsPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
