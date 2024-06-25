'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module GenerateReturnVersionDataService
 */

// const SessionModel = require('../../models/session.model.js')

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 *
 * > This service is work in progress. Some of the functionality described is yet to be implemented
 *
 * After fetching the session instance for the returns requirements journey in progress it validates that what the user
 * has setup can be persisted for the licence.
 *
 * If valid it converts the session data to return requirements records then deletes the session record.
 *
 * @param {string} session - The session data required to set up a new return version for a licence
 * @param {number} userId - The id of the logged in user
 *
 * @returns {string} The licence ID
 */
async function go (session, userId) {
  const returnVersion = _generateReturnVersion(session, userId)

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

function _generateReturnVersion (session, userId) {
  const multipleUpload = _multipleUpload(session?.additionalSubmissionOptions)

  return {
    licenceId: session.licence.id,
    version: 1, // TODO: Need to work this out
    startDate: _calculateStartDate(session),
    endDate: null, // TODO: If this has been inserted between versions then we will have to make the end date a day before the start date of the next one. CONFIRM IT DOESN'T JUST REPLACE THE ONES AFTER IT
    status: 'current',
    multipleUpload,
    notes: session?.note?.content,
    createdBy: userId
  }
}

function _multipleUpload (additionalSubmissionOptions) {
  return additionalSubmissionOptions ? additionalSubmissionOptions.includes('multiple-upload') : false
}

module.exports = {
  go
}
