'use strict'

/**
 * Creates a new return submission, superseding a previous one if it exists
 * @module CreateReturnSubmissionService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionModel = require('../../../models/return-submission.model.js')

/**
 * Creates a new return submission. If a previous submission exists for this return log ID, it marks that submission as
 * superseded and creates this return submission with the next version number. Otherwise, the version number is 1.
 *
 * @param {string} returnLogId - ID of the return log (typically something like
 * 'v1:6:01/234:12345678:2024-11-01:2025-10-31')
 * @param {string} userId - ID of the user creating the return submission (typically an email address)
 * @param {string} userType - Type of user (eg. 'internal' or 'external')
 * @param {object} metadata - Metadata for the return submission
 * @param {boolean} nilReturn - Indicates if the return is a nil return
 * @param {object} [trx=null] - Optional {@link https://vincit.github.io/objection.js/guide/transactions.html#transactions | transaction object}
 *
 * @returns {module:ReturnSubmissionModel} - The created return submission
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
