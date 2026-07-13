/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

import CheckPresenter from '../../../presenters/return-logs/setup/check.presenter.js'
import CheckValidator from '../../../validators/return-logs/setup/check.validator.js'
import CreateReturnLinesService from './create-return-lines.service.js'
import CreateReturnSubmissionService from './create-return-submission.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import GenerateReturnSubmissionMetadata from './generate-return-submission-metadata.service.js'
import ReturnLogModel from '../../../models/return-log.model.js'
import SessionModel from '../../../models/session.model.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { timestampForPostgres } from '../../../lib/general.lib.js'

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
export default async function (sessionId, user) {
  const session = await FetchSessionDal(sessionId)

  const error = _validate(session)

  if (!error) {
    await _save(session, user)

    return { returnLogId: session.returnLogId }
  }

  const formattedData = CheckPresenter(session)

  return {
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

  const metadata = GenerateReturnSubmissionMetadata(session)

  await ReturnLogModel.transaction(async (trx) => {
    const returnSubmission = await CreateReturnSubmissionService(metadata, session, timestamp, user, trx)

    await CreateReturnLinesService(returnSubmission.id, session, timestamp, trx)

    await _markReturnLogAsSubmitted(session.returnLogId, session.receivedDate, timestamp, trx)
    await _cleanupSession(session.id, trx)
  })
}

function _validate(session) {
  if (session.journey === 'nilReturn') {
    return null
  }

  const validationResult = CheckValidator(session)

  return formatValidationResult(validationResult)
}
