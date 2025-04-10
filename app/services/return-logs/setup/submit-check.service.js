'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const CreateNewReturnLinesService = require('./create-new-return-lines.service.js')
const CreateNewReturnRequirementPointsService = require('./create-new-return-requirement-points.service.js')
const CreateNewReturnRequirementsService = require('./create-new-return-requirements.service.js')
const CreateNewReturnVersionService = require('./create-new-return-version.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * TODO: Document
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @returns {Promise<object>} - The result of the submission process
 */
async function go(sessionId) {
  // TODO: Consider error handling
  const session = await SessionModel.query().findById(sessionId)

  const { licenceId, lines, returnSubmissionId, returnLogId } = session

  await ReturnLogModel.transaction(async (trx) => {
    const { currentReturnVersionId, newReturnVersionId } = await CreateNewReturnVersionService.go(licenceId, trx)
    const { currentReturnRequirements, newReturnRequirements } = await CreateNewReturnRequirementsService.go(
      licenceId,
      currentReturnVersionId,
      newReturnVersionId,
      trx
    )

    await CreateNewReturnRequirementPointsService.go(currentReturnRequirements, newReturnRequirements, trx)
    await CreateNewReturnLinesService.go(lines, returnSubmissionId, trx)

    await _markReturnLogAsSubmitted(returnLogId, trx)
    await _cleanupSession(sessionId, trx)
  })

  // TODO: Confirm how we want to exit the service
  return returnLogId
}

/**
 * Updates the return log status to reflect submission
 *
 * @param {string} returnLogId - The ID of the return log
 * @param trx
 * @returns {Promise<void>}
 */
async function _markReturnLogAsSubmitted(returnLogId, trx) {
  await ReturnLogModel.query(trx).patch({ status: 'submitted' }).where({ id: returnLogId })
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
