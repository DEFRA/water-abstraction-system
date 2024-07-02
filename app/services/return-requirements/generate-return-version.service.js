'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionService
 */

const GenerateReturnVersionRequirementsService = require('./generate-return-version-requirements.service.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 *
 * Creates the data needed to populate the `return_versions`, `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} sessionData - The session data required to set up a new return version for a licence
 * @param {number} userId - The id of the logged in user
 *
 * @returns {Promise<Object>} The new return version and requirement data for a licence
 */
async function go (sessionData, userId) {
  const returnVersion = await _generateReturnVersion(sessionData, userId)
  const returnRequirements = await GenerateReturnVersionRequirementsService.go(sessionData.licence.id, sessionData.requirements)

  return {
    returnRequirements,
    returnVersion
  }
}

function _calculateStartDate (sessionData) {
  if (sessionData.startDateOptions === 'anotherStartDate') {
    // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
    // January is actually 0, February is 1 etc. This is why we deduct 1 from the month.
    return new Date(sessionData.startDateYear, sessionData.startDateMonth - 1, sessionData.startDateDay)
  }

  return sessionData.licence.currentVersionStartDate
}

async function _generateReturnVersion (sessionData, userId) {
  return {
    createdBy: userId,
    endDate: null,
    licenceId: sessionData.licence.id,
    multipleUpload: _multipleUpload(sessionData?.additionalSubmissionOptions),
    notes: sessionData?.note?.content,
    reason: sessionData.reason,
    startDate: _calculateStartDate(sessionData),
    status: 'current',
    version: await _getNextVersionNumber(sessionData.licence.id)
  }
}

async function _getNextVersionNumber (licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .first()

  if (lastVersionNumber) {
    return lastVersionNumber + 1
  }

  return 1
}

function _multipleUpload (additionalSubmissionOptions) {
  return additionalSubmissionOptions ? additionalSubmissionOptions.includes('multiple-upload') : false
}

module.exports = {
  go
}
