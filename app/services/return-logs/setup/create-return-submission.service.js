'use strict'

/**
 * Creates new return submission, superseding a previous one if it exists
 * @module CreateReturnSubmissionService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionModel = require('../../../models/return-submission.model.js')

/**
 * TODO: Document
 *
 * @param returnLogId
 * @param userId
 * @param userType
 * @param metadata
 * @param nilReturn
 * @param trx
 *
 * @returns
 */
async function go(returnLogId, userId, userType, metadata, nilReturn, trx = null) {
  const { version, previousVersion } = await _getVersionNumber(returnLogId, trx)

  const returnSubmission = {
    id: generateUUID(),
    returnLogId,
    userId,
    userType,
    version,
    metadata,
    nilReturn,
    current: true,
    createdAt: timestampForPostgres()
  }

  if (previousVersion) {
    await _markPreviousVersionAsSuperseded(returnLogId, previousVersion, trx)
  }

  return ReturnSubmissionModel.query(trx).insert(returnSubmission)
}

async function _getVersionNumber(returnLogId, trx) {
  const { previousVersion } = await ReturnSubmissionModel.query(trx)
    .max('version as previousVersion')
    .whereLike('returnLogId', `${returnLogId}%`)
    .first()

  return {
    previousVersion: previousVersion || null,
    version: previousVersion + 1 || 1
  }
}

async function _markPreviousVersionAsSuperseded(returnLogId, version, trx) {
  await ReturnSubmissionModel.query(trx)
    .patch({ current: false })
    .whereLike('returnLogId', `${returnLogId}%`)
    .where('version', version)
}

module.exports = {
  go
}
