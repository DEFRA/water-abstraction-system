'use strict'

/**
 * Creates a new return submission, superseding a previous one if it exists
 * @module CreateReturnSubmissionService
 */

const { generateUUID } = require('../../../lib/general.lib.js')
const ReturnSubmissionModel = require('../../../models/return-submission.model.js')

/**
 * Creates a new return submission. The version number will be 1 if no previous submission exists for this return log
 * ID; otherwise, the version number will be incremented by 1
 *
 * If a previous submission does exist then it will be marked as superseded by setting its `current` property to false
 *
 * @param {object} metadata - Metadata for the return submission
 * @param {object} session - Session object containing the return submission data
 * @param {Date} timestamp - The timestamp to use for the createdAt property
 * @param {module:UserModel} user - Instance representing the user that originated the request
 * @param {object} [trx=null] - Optional {@link https://vincit.github.io/objection.js/guide/transactions.html#transactions | transaction object}
 *
 * @returns {Promise<module:ReturnSubmissionModel>} - The created return submission
 */
async function go(metadata, session, timestamp, user, trx = null) {
  const { version, previousVersion } = await _determineVersionNumbers(session.returnLogId, trx)

  const returnSubmission = {
    id: generateUUID(),
    createdAt: timestamp,
    createdBy: user.id,
    current: true,
    nilReturn: session.journey === 'nil-return',
    metadata,
    notes: session.note?.content,
    returnLogId: session.returnLogId,
    userId: user.username,
    userType: 'internal',
    version
  }

  if (previousVersion) {
    await _markPreviousVersionAsSuperseded(session.returnLogId, previousVersion, trx)
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
