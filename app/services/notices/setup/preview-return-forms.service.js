'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview/{contactHashId}/return-forms/{returnId}' page
 *
 * @module PreviewReturnFormsService
 */

const FetchRecipientsService = require('./fetch-recipients.service.js')
const PreparePaperReturnService = require('./prepare-paper-return.service.js')
const ReturnFormsNotificationPresenter = require('../../../presenters/notices/setup/return-forms-notification.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview/{contactHashId}/return-forms/{returnId}' page
 *
 * This service returns the file to be display in the browser. This will likely be the built-in pdf viewer.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} returnId - The UUID of the return log
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(sessionId, contactHashId, returnId) {
  const session = await SessionModel.query().findById(sessionId)
  const { licenceRef, dueReturns } = session

  const [recipient] = await _recipient(session, contactHashId)

  const dueReturnLog = _dueReturnLog(dueReturns, returnId)

  const notification = ReturnFormsNotificationPresenter.go(recipient, licenceRef, null, dueReturnLog)

  const returnFormRequest = await PreparePaperReturnService.go(notification)

  return returnFormRequest.response.body
}

function _dueReturnLog(dueReturns, returnId) {
  return dueReturns.find((dueReturn) => {
    return dueReturn.returnId === returnId
  })
}

async function _recipient(session, contactHashId) {
  const recipients = await FetchRecipientsService.go(session)

  return recipients.filter((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
