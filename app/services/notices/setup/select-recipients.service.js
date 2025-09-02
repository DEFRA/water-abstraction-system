'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module SelectRecipientsService
 */

const FetchRecipientsService = require('./fetch-recipients.service.js')
const SelectRecipientsPresenter = require('../../../presenters/notices/setup/select-recipients.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipients = await FetchRecipientsService.go(session)

  const pageData = SelectRecipientsPresenter.go(session, recipients)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
