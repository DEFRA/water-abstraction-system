'use strict'

/**
 * Creates a new return submission, superseding a previous one if it exists
 * @module CreateReturnSubmissionService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionModel = require('../../../models/return-submission.model.js')

/**
 * Creates a new return submission. The version number will be 1 if no previous submission exists for this return log
 * ID; otherwise, the version number will be incremented by 1
 *
 * If a previous submission does exist then it will be marked as superseded by setting its `current` property to false
 *
 * @param {string} returnLogId - ID of the return log (typically something like v1:6:01/23:987654:2024-11-01:2025-10-31)
 * @param {string} userId - ID of the user creating the return submission (typically an email address)
 * @param {string} userType - Type of user (eg. 'internal' or 'external')
 * @param {object} metadata - Metadata for the return submission
 * @param {boolean} nilReturn - Indicates if the return is a nil return
 * @param {object} [trx=null] - Optional {@link https://vincit.github.io/objection.js/guide/transactions.html#transactions | transaction object}
 *
 * @returns {Promise<module:ReturnSubmissionModel>} - The created return submission
 */
async function go(returnLogId, userId, userType, metadata, nilReturn, trx = null) {
  const { version, previousVersion } = await _determineVersionNumbers(returnLogId, trx)

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

async function _determineVersionNumbers(returnLogId, trx) {
  const { previousVersion } = await ReturnSubmissionModel.query(trx)
    .max('version as previousVersion')
    .where('returnLogId', returnLogId)
    .first()

  return {
    previousVersion: previousVersion || null,
    version: previousVersion + 1 || 1
  }
}

async function _markPreviousVersionAsSuperseded(returnLogId, version, trx) {
  await ReturnSubmissionModel.query(trx)
    .patch({ current: false })
    .where('returnLogId', returnLogId)
    .where('version', version)
}

module.exports = {
  go
}
