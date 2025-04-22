'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const GenerateReturnVersionService = require('./generate-return-version.service.js')
const PersistReturnVersionService = require('./persist-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../return-logs/process-licence-return-logs.service.js')
const SessionModel = require('../../../../models/session.model.js')
const VoidReturnLogsService = require('../../../return-logs/void-return-logs.service.js')

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 *
 * After fetching the session instance for the returns requirements journey in progress it validates that what the user
 * has setup can be persisted for the licence.
 *
 * If valid it converts the session data to return requirements records then deletes the session record.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {number} userId - The id of the logged in user
 *
 * @returns {string} The licenceId
 */
async function go(sessionId, userId) {
  const session = await SessionModel.query().findById(sessionId)

  await _processReturnVersion(session, userId)

  await SessionModel.query().deleteById(sessionId)

  return session.licence.id
}

async function _processReturnVersion(session, userId) {
  const returnVersionData = await GenerateReturnVersionService.go(session.data, userId)

  await PersistReturnVersionService.go(returnVersionData)

  const changeDate = new Date(returnVersionData.returnVersion.startDate)
  changeDate.setTime(changeDate.getTime() - ONE_DAY_IN_MILLISECONDS)

  if (session.data.journey === 'no-returns-required') {
    await VoidReturnLogsService.go(
      session.data.licence.licenceRef,
      returnVersionData.returnVersion.startDate,
      returnVersionData.returnVersion.endDate
    )
  }

  await ProcessLicenceReturnLogsService.go(returnVersionData.returnVersion.licenceId, changeDate)
}

module.exports = {
  go
}
