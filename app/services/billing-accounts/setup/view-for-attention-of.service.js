'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/for-attention-of` page
 *
 * @module ForAttentionOfService
 */

const ForAttentionOfPresenter = require('../../../presenters/billing-accounts/setup/for-attention-of.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/for-attention-of` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ForAttentionOfPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
