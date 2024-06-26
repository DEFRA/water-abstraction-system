'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionDataService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 *
 * Creates the data needed to populate the `return_versions`, `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} session - The session data required to set up a new return version for a licence
 * @param {number} userId - The id of the logged in user
 *
 * @returns {string} The licence ID
 */
async function go (session, userId) {
  const returnVersion = await _generateReturnVersionData(session, userId)

  return {
    returnVersion
  }
}

function _calculateStartDate (session) {
  if (session.startDateOptions === 'anotherStartDate') {
    // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
    // January is actually 0, February is 1 etc. This is why we deduct 1 from the month.
    return new Date(session.startDateYear, session.startDateMonth - 1, session.startDateDay)
  }

  return session.licence.currentVersionStartDate
}

async function _generateReturnVersionData (session, userId) {
  const multipleUpload = _multipleUpload(session?.additionalSubmissionOptions)

  return {
    licenceId: session.licence.id,
    version: await _getNextVersionNumber(session.licence.id),
    startDate: _calculateStartDate(session),
    endDate: null,
    status: 'current',
    multipleUpload,
    notes: session?.note?.content,
    createdBy: userId
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
