'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const CreateReturnLinesService = require('./create-return-lines.service.js')
const CreateReturnSubmissionService = require('./create-return-submission.service.js')
const GenerateReturnSubmissionMetadata = require('./generate-return-submission-metadata.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Service to handle the submission of the check page in the return logs setup flow.
 *
 * This function orchestrates the submission process. It generates metadata, creates a return submission, creates new
 * return lines, marks the return log as submitted, and cleans up the session.
 *
 * All of this is wrapped in a transaction so that if any part of it fails, the entire process is rolled back.
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @param {module:UserModel} user - Instance representing the user that originated the request
 *
 * @returns {Promise<string>} - The ID of the submitted return log
 */
async function go(sessionId, user) {
  const session = await SessionModel.query().findById(sessionId)

  const metadata = GenerateReturnSubmissionMetadata.go(session)

  await ReturnLogModel.transaction(async (trx) => {
    const returnSubmission = await CreateReturnSubmissionService.go(
      session.returnLogId,
      user.username,
      metadata,
      session.journey === 'nil-return',
      session.note?.content,
      user.id,
      trx
    )

    await CreateReturnLinesService.go(
      session.lines,
      returnSubmission.id,
      session.returnsFrequency,
      session.units,
      session.reported === 'abstraction-volumes',
      session.meterProvided === 'yes',
      session.startReading,
      session.meter10TimesDisplay === 'yes',
      trx
    )

    await _markReturnLogAsSubmitted(session.returnLogId, trx)
    await _cleanupSession(sessionId, trx)
  })

  return session.returnLogId
}

async function _markReturnLogAsSubmitted(returnLogId, trx) {
  await ReturnLogModel.query(trx).patch({ status: 'completed' }).where({ id: returnLogId })
}

async function _cleanupSession(sessionId, trx) {
  await SessionModel.query(trx).deleteById(sessionId)
}

module.exports = {
  go
}
