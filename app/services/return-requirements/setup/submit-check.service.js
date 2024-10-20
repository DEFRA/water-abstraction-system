'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const GenerateReturnVersionService = require('./generate-return-version.service.js')
const PersistReturnVersionService = require('./persist-return-version.service.js')
const SessionModel = require('../../../models/session.model.js')

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
 * @returns {string} The licence ID
 */
async function go (sessionId, userId) {
  const session = await SessionModel.query().findById(sessionId)

  const returnVersionData = await GenerateReturnVersionService.go(session.data, userId)

  await PersistReturnVersionService.go(returnVersionData)

  await SessionModel.query().deleteById(sessionId)

  return session.licence.id
}

module.exports = {
  go
}
