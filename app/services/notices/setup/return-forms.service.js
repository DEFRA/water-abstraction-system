'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/return-forms` page
 *
 * @module ReturnFormsService
 */

const ReturnFormsPresenter = require('../../../presenters/notices/setup/return-forms.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/return-forms` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ReturnFormsPresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
