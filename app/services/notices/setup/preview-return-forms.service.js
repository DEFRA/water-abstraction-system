'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview/{contactHashId}/return-forms/{returnId}' page
 *
 * @module PreviewReturnFormsService
 */

const PrepareReturnFormsService = require('./prepare-return-forms.service.js')
const RecipientsService = require('./recipients.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview/{contactHashId}/return-forms/{returnId}' page
 *
 * This service returns the file to be display in the browser. This will likely be the built-in pdf viewer.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} returnId - The UUID of the return log
 * @param {string} contactHashId
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(sessionId, returnId, contactHashId) {
  const session = await SessionModel.query().findById(sessionId)

  const [recipient] = await _recipient(contactHashId, session)

  return PrepareReturnFormsService.go(session, returnId, recipient)
}

async function _recipient(contactHashId, session) {
  const recipients = await RecipientsService.go(session)

  // Using `filter` rather than `find` ensures we return an array which makes it simpler to reuse existing logic
  return recipients.filter((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
