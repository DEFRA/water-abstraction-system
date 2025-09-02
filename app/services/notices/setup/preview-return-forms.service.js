'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview/{contactHashId}/return-forms/{returnId}' page
 *
 * @module PreviewReturnFormsService
 */

const FetchRecipientsService = require('./fetch-recipients.service.js')
const PrepareReturnFormsService = require('./prepare-return-forms.service.js')
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

  const [recipient] = await _recipient(session, contactHashId)

  return PrepareReturnFormsService.go(session, returnId, recipient)
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
