'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const CreateNewReturnLinesService = require('./create-new-return-lines.service.js')
const CreateReturnSubmissionService = require('./create-return-submission.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * TODO: Document
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @param {module:UserModel} user - Instance representing the user that originated the request
 *
 * @returns {Promise<object>} - The result of the submission process
 */
async function go(sessionId, user) {
  // TODO: Consider error handling
  const session = await SessionModel.query().findById(sessionId)

  const metadata = _generateMetadata(session)

  await ReturnLogModel.transaction(async (trx) => {
    const returnSubmission = await CreateReturnSubmissionService.go(
      session.returnLogId,
      user.username,
      'internal',
      metadata,
      session.nilReturn,
      trx
    )

    await CreateNewReturnLinesService.go(
      session.lines,
      returnSubmission.id,
      session.returnsFrequency,
      session.units,
      session.meterProvided,
      trx
    )

    await _markReturnLogAsSubmitted(session.returnLogId, trx)
    await _cleanupSession(sessionId, trx)
  })

  // TODO: Confirm how we want to exit the service
  return session.returnLogId
}

// TODO: Confirm metadata format and implement
function _generateMetadata(session) {
  return {}
}

/**
 * Updates the return log status to reflect submission
 *
 * @param {string} returnLogId - The ID of the return log
 * @param trx
 * @returns {Promise<void>}
 */
async function _markReturnLogAsSubmitted(returnLogId, trx) {
  await ReturnLogModel.query(trx).patch({ status: 'completed' }).where({ id: returnLogId })
}

/**
 * Cleans up the session after submission
 *
 * @param {string} sessionId - The ID of the session to delete
 * @param trx
 * @returns {Promise<void>}
 */
async function _cleanupSession(sessionId, trx) {
  await SessionModel.query(trx).deleteById(sessionId)
}

module.exports = {
  go
}
