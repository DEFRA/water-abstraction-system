'use strict'

/**
 * Orchestrates the process of creating a new return version from the session data
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

/**
 * Orchestrates the process of creating a new return version from the session data
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @param {object} user - The user making the submission
 * @returns {Promise<object>} - The result of the submission process
 */
async function go(sessionId, user) {
  // Retrieve session data
  const session = await _fetchSessionData(sessionId)

  if (!session) {
    return {
      error: {
        message: 'Session not found'
      }
    }
  }

  try {
    // Create new return version
    const returnVersion = await _createReturnVersion(session, user)

    // Mark previous version as not current, excluding the newly created version
    await _updatePreviousVersion(session.data.returnLog.licenceId, returnVersion.id)

    // Create and persist line objects
    await _createReturnLines(session, returnVersion.id)

    // Update return log status
    await _updateReturnLogStatus(session.data.returnLog.id)

    // Clean up session
    await _cleanupSession(sessionId)

    return {
      returnLogId: session.data.returnLog.id
    }
  } catch (error) {
    return {
      error: {
        message: error.message
      }
    }
  }
}

/**
 * Fetches the session data for the given session ID
 *
 * @param {string} sessionId - The ID of the session to fetch
 * @returns {Promise<object>} - The session data
 */
async function _fetchSessionData(sessionId) {
  return SessionModel.query().findById(sessionId)
}

/**
 * Creates a new return version from the session data
 *
 * @param {object} session - The session data containing return information
 * @param {object} user - The user creating the return version
 * @returns {Promise<object>} - The created return version
 */
async function _createReturnVersion(session, user) {
  const nextVersionNumber = await _nextVersionNumber(session.data.returnLog.licenceId)

  // Implementation details for creating the return version
  const returnVersion = {
    licenceId: session.data.returnLog.licenceId,
    returnLogId: session.data.returnLog.id,
    version: nextVersionNumber,
    status: 'current',
    startDate: new Date(session.data.startDate),
    endDate: session.data.endDate ? new Date(session.data.endDate) : null,
    createdBy: user.id
  }

  return ReturnVersionModel.query().insert(returnVersion)
}

/**
 * Determines the next version number for a return version
 *
 * @param {string} licenceId - The ID of the licence
 * @returns {Promise<number>} - The next version number
 */
async function _nextVersionNumber(licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .first()

  return (lastVersionNumber || 0) + 1
}

/**
 * Updates previous return versions to mark them as not current
 *
 * @param {string} licenceId - The ID of the licence
 * @param {string} newVersionId - The ID of the newly created version to exclude
 * @returns {Promise<void>}
 */
async function _updatePreviousVersion(licenceId, newVersionId) {
  // Implementation details for updating previous versions
  // Exclude the newly created version from being marked as superseded
  await ReturnVersionModel.query()
    .patch({ status: 'superseded' })
    .where({ licenceId, status: 'current' })
    .whereNot('id', newVersionId)
}

/**
 * Creates return lines from the session data
 *
 * @param {object} session - The session data containing line information
 * @param {string} returnVersionId - The ID of the return version
 * @returns {Promise<void>}
 */
async function _createReturnLines(session, returnVersionId) {
  // Implementation details for creating return lines
  const { lines } = session.data

  if (!lines || !lines.length) {
    return
  }

  // Map the session data to ReturnSubmissionLineModel format
  const returnLines = lines.map((line) => ({
    returnSubmissionId: returnVersionId,
    startDate: new Date(line.startDate),
    endDate: new Date(line.endDate),
    quantity: line.quantity
  }))

  // Insert the return lines using ReturnSubmissionLineModel
  await ReturnSubmissionLineModel.query().insert(returnLines)
}

/**
 * Updates the return log status to reflect submission
 *
 * @param {string} returnLogId - The ID of the return log
 * @returns {Promise<void>}
 */
async function _updateReturnLogStatus(returnLogId) {
  // Implementation details for updating return log status
  await ReturnLogModel.query().patch({ status: 'submitted' }).where({ id: returnLogId })
}

/**
 * Cleans up the session after successful submission
 *
 * @param {string} sessionId - The ID of the session to clean up
 * @returns {Promise<void>}
 */
async function _cleanupSession(sessionId) {
  await SessionModel.query().deleteById(sessionId)
}

module.exports = {
  go
}
