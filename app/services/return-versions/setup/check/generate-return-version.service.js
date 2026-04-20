'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionService
 */

const GenerateReturnVersionRequirementsService = require('./generate-return-version-requirements.service.js')
const ProcessExistingReturnVersionsService = require('./process-existing-return-versions.service.js')
const ReturnVersionModel = require('../../../../models/return-version.model.js')
const { isQuarterlyReturnSubmissions } = require('../../../../lib/dates.lib.js')

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 *
 * Creates the data needed to populate the `return_versions`, `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} session - The session data required to set up a new return version for a licence
 * @param {number} userId - The id of the logged in user
 * @param {object} trx - Transaction object
 *
 * @returns {Promise<object>} The new return version and requirement data for a licence
 */
async function go(session, userId, trx) {
  const nextVersionNumber = await _nextVersionNumber(session.licence.id)

  const returnVersion = await _generateReturnVersion(nextVersionNumber, session, userId, trx)
  const returnRequirements = await _generateReturnRequirements(session)

  return {
    returnRequirements,
    returnVersion
  }
}

async function _generateReturnRequirements(session) {
  // When no returns are required a return version is created without any return requirements
  if (session.journey === 'no-returns-required') {
    return []
  }

  const returnRequirements = await GenerateReturnVersionRequirementsService.go(session.licence.id, session.requirements)

  return returnRequirements
}

async function _generateReturnVersion(nextVersionNumber, session, userId, trx) {
  const startDate = new Date(session.returnVersionStartDate)
  let endDate = null
  let quarterlyReturns = false

  if (nextVersionNumber > 1) {
    endDate = await ProcessExistingReturnVersionsService.go(session.licence.id, startDate, trx)
  }

  if (isQuarterlyReturnSubmissions(session.returnVersionStartDate)) {
    quarterlyReturns = session.quarterlyReturns
  }

  return {
    createdBy: userId,
    endDate,
    licenceId: session.licence.id,
    multipleUpload: session.multipleUpload,
    notes: session?.note?.content,
    quarterlyReturns,
    reason: session.reason,
    startDate,
    status: 'current',
    version: nextVersionNumber
  }
}

async function _nextVersionNumber(licenceId) {
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
