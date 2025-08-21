'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-return-forms` page
 *
 * @module CheckReturnFormsService
 */

const CheckReturnFormsPresenter = require('../../../../presenters/notices/setup/preview/check-return-forms.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-return-forms` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} contactHashId - The recipients unique identifier
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, contactHashId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckReturnFormsPresenter.go(session, contactHashId)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
