'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionService
 */

const GenerateReturnVersionRequirementsService = require('./generate-return-version-requirements.service.js')
const ProcessExistingReturnVersionsService = require('./process-existing-return-versions.service.js')
const ReturnVersionModel = require('../../../../models/return-version.model.js')
const { isQuarterlyReturnSubmissions } = require('../../../../lib/dates.lib')

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
  const nextVersionNumber = await _nextVersionNumber(sessionData.licence.id)

  const returnVersion = await _generateReturnVersion(nextVersionNumber, sessionData, userId)
  const returnRequirements = await _generateReturnRequirements(sessionData)

  return {
    returnRequirements,
    returnVersion
  }
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

async function _generateReturnVersion (nextVersionNumber, sessionData, userId) {
  const startDate = new Date(sessionData.returnVersionStartDate)
  let endDate = null
  let quarterlyReturns = false

  if (nextVersionNumber > 1) {
    endDate = await ProcessExistingReturnVersionsService.go(sessionData.licence.id, startDate)
  }

  if (isQuarterlyReturnSubmissions(sessionData.returnVersionStartDate)) {
    quarterlyReturns = sessionData.quarterlyReturns
  }

  return {
    createdBy: userId,
    endDate,
    licenceId: sessionData.licence.id,
    multipleUpload: sessionData.multipleUpload,
    notes: sessionData?.note?.content,
    quarterlyReturns,
    reason: sessionData.reason,
    startDate,
    status: 'current',
    version: nextVersionNumber
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

module.exports = {
  go
}
