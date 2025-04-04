'use strict'

/**
 * Creates a new return version from session data and marks the previous return version as superseded
 * @module CreateNewReturnVersionService
 */

const ReturnVersionModel = require('../../../models/return-version.model.js')

/**
 * TODO: Document
 *
 * @param session
 * @returns
 */
async function go(session) {
  const returnVersion = await _createReturnVersion(session)

  await _markPreviousVersionAsSuperseded(session.data.licenceId, returnVersion.id)

  return returnVersion
}

/**
 * Marks the previous return version as superseded
 *
 * @param {string} licenceId - The ID of the licence
 * @param {string} newVersionId - The ID of the newly created version to exclude
 * @returns {Promise<void>}
 */
async function _markPreviousVersionAsSuperseded(licenceId, newVersionId) {
  await ReturnVersionModel.query()
    .patch({ status: 'superseded' })
    .where({ licenceId, status: 'current' })
    .whereNot('id', newVersionId)
}

/**
 * Creates a new return version from the session data
 *
 * @param {object} session - The session data containing return information
 * @returns {Promise<object>} - The created return version
 */
async function _createReturnVersion(session) {
  const nextVersionNumber = await _nextVersionNumber(session.data.licenceId)

  // TODO: Confirm externalId, reason, multipleUploads, quarterlyReturns
  const returnVersion = {
    licenceId: session.data.licenceId,
    version: nextVersionNumber,
    status: 'current',
    startDate: new Date(session.data.startDate),
    endDate: session.data.endDate ? new Date(session.data.endDate) : null
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

module.exports = {
  go
}
