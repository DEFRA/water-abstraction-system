'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionService
 */

const GenerateReturnVersionRequirementsService = require('./generate-return-version-requirements.service.js')
const ProcessExistingReturnVersionsService = require('./process-existing-return-versions.service.js')
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
 * @returns {Promise<object>} The new return version and requirement data for a licence
 */
async function go (sessionData, userId) {
  const returnVersionsExist = sessionData.licence.returnVersions.length > 0

  const returnVersion = await _generateReturnVersion(returnVersionsExist, sessionData, userId)
  const returnRequirements = await _generateReturnRequirements(sessionData)

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

  return new Date(sessionData.licence.currentVersionStartDate)
}

async function _generateReturnRequirements (sessionData) {
  // When no returns are required a return version is created without any return requirements
  if (sessionData.journey === 'no-returns-required') {
    return []
  }

  const returnRequirements = await GenerateReturnVersionRequirementsService.go(
    sessionData.licence.id,
    sessionData.requirements
  )

  return returnRequirements
}

async function _generateReturnVersion (returnVersionsExist, sessionData, userId) {
  const startDate = _calculateStartDate(sessionData)
  let endDate = null

  if (returnVersionsExist) {
    endDate = await ProcessExistingReturnVersionsService.go(sessionData.licence.id, startDate)
  }

  return {
    createdBy: userId,
    endDate,
    licenceId: sessionData.licence.id,
    multipleUpload: _multipleUpload(sessionData?.additionalSubmissionOptions),
    notes: sessionData?.note?.content,
    reason: sessionData.reason,
    startDate,
    status: 'current',
    version: await _nextVersionNumber(sessionData.licence.id)
  }
}

async function _nextVersionNumber (licenceId) {
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
