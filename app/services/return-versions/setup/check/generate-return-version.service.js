'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionService
 */

const DetermineNextVersionNumberDal = require('../../../../dal/return-versions/determine-next-version-number.dal.js')
const GenerateReturnVersionRequirementsService = require('./generate-return-version-requirements.service.js')
const { isQuarterlyReturnSubmissions } = require('../../../../lib/dates.lib.js')

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 *
 * Creates the data needed to populate the `return_versions`, `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} session - The session data required to set up a new return version for a licence
 * @param {number} userId - The ID of the logged in user
 *
 * @returns {Promise<object>} The new return version and its return requirements data for a licence
 */
async function go(session, userId) {
  const nextVersionNumber = await DetermineNextVersionNumberDal.go(session.licence.id)

  const returnVersion = await _generateReturnVersion(nextVersionNumber, session, userId)
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

async function _generateReturnVersion(nextVersionNumber, session, userId) {
  const startDate = new Date(session.returnVersionStartDate)

  let quarterlyReturns = false

  // NOTE: This is a safety check just in case someone started a journey and was able to select quarterly returns, but
  // then went back and set the start date to something before 1st April 2025.
  // Quarterly returns is only available for return versions with a start date on or after 1st April 2025
  if (isQuarterlyReturnSubmissions(session.returnVersionStartDate)) {
    quarterlyReturns = session.quarterlyReturns
  }

  return {
    createdBy: userId,
    endDate: null,
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

module.exports = {
  go
}
