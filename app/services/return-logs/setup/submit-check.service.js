'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const CheckPresenter = require('../../../presenters/return-logs/setup/check.presenter.js')
const CheckValidator = require('../../../validators/return-logs/setup/check.validator.js')
const CreateReturnLinesService = require('./create-return-lines.service.js')
const CreateReturnSubmissionService = require('./create-return-submission.service.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')
const GenerateReturnSubmissionMetadata = require('./generate-return-submission-metadata.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Service to handle the submission of the check page in the return logs setup flow.
 *
 * This function orchestrates the submission process. It generates metadata, creates a return submission, creates new
 * return lines, marks the return log as submitted by updating its status and received date, and cleans up the session.
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

  const error = _validate(session)

  if (!error) {
    await _save(session, user)

    return { returnLogId: session.returnLogId }
  }

  const formattedData = CheckPresenter.go(session)

  return {
    activeNavBar: 'search',
    error,
    ...formattedData
  }
}

async function _cleanupSession(sessionId, trx) {
  await SessionModel.query(trx).deleteById(sessionId)
}

async function _markReturnLogAsSubmitted(returnLogId, receivedDate, timestamp, trx) {
  await ReturnLogModel.query(trx)
    .patch({ status: 'completed', receivedDate, updatedAt: timestamp })
    .where({ id: returnLogId })
}

async function _save(session, user) {
  const timestamp = timestampForPostgres()

  const metadata = GenerateReturnSubmissionMetadata.go(session)

  await ReturnLogModel.transaction(async (trx) => {
    const returnSubmission = await CreateReturnSubmissionService.go(metadata, session, timestamp, user, trx)

    await CreateReturnLinesService.go(returnSubmission.id, session, timestamp, trx)

    await _markReturnLogAsSubmitted(session.returnLogId, session.receivedDate, timestamp, trx)
    await _cleanupSession(session.id, trx)
  })
}

function _validate(session) {
  if (session.journey === 'nil-return') {
    return null
  }

  const validationResult = CheckValidator.go(session)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
