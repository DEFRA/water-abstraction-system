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

  const selectedRecipients = _selectedRecipients(session)

  const recipients = await FetchRecipientsService.go(session)

  const pageData = SelectRecipientsPresenter.go(session, recipients, selectedRecipients)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

/**
 * Clear the 'selectedRecipients' from the session to fetch all the recipients
 *
 * Return the current selected recipients to mark as 'checked' on the page
 *
 * @private
 */
function _selectedRecipients(session) {
  const selectedRecipients = session.selectedRecipients

  delete session.selectedRecipients

  return selectedRecipients
}

module.exports = {
  go
}
