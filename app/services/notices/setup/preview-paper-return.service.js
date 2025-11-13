'use strict'

/**
 * Orchestrates fetching and presenting the data for previewing a paper return
 *
 * @module PreviewPaperReturnService
 */

const FetchRecipientsService = require('./fetch-recipients.service.js')
const PaperReturnNotificationsPresenter = require('../../../presenters/notices/setup/paper-return-notifications.presenter.js')
const PreparePaperReturnService = require('./prepare-paper-return.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for previewing a paper return
 *
 * This service returns the file data for the PDF. We return that to the browser to be displayed. Most browsers have
 * some form of in-built PDF display (certainly the ones our users use do), else they'll prompt the user for a decision.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} contactHashId - The unique identifier of the recipient to preview
 * @param {string} returnLogId - The UUID of the return log to preview
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(sessionId, contactHashId, returnLogId) {
  const session = await SessionModel.query().findById(sessionId)

  // NOTE: The notifications the presenter generates are based on the combination of recipients and selected return logs
  // that have been set during setup. We're using the same presenter to generate our preview notification, so for this
  // to work we have to set the return log we're previewing as the 'selected' return.
  session.selectedReturns = [returnLogId]

  const selectedRecipient = await _selectedRecipient(session, contactHashId)

  // The presenter returns an array because it is also used when sending the paper return. But in this case we just want
  // to look at a single recipient and return log so we know we'll just get one notification back in the array.
  const notifications = PaperReturnNotificationsPresenter.go(session, [selectedRecipient], null)

  const returnFormRequest = await PreparePaperReturnService.go(notifications[0])

  return returnFormRequest.response.body
}

async function _selectedRecipient(session, contactHashId) {
  const recipients = await FetchRecipientsService.go(session)

  return recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
