'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const CheckLicenceEndedService = require('./check-licence-ended.service.js')
const ExpandedError = require('../../errors/expanded.error.js')
const GenerateReturnVersionService = require('./generate-return-version.service.js')
const PersistReturnVersionService = require('./persist-return-version.service.js')
const SessionModel = require('../../models/session.model.js')

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
 * @param {String} sessionId - The UUID for return requirement setup session record
 * @param {Number} userId - The id of the logged in user
 *
 * @returns {String} The licence ID
 */
async function go (sessionId, userId) {
  const session = await SessionModel.query().findById(sessionId)

  await _validateLicence(session.licence.id)

  const returnVersionData = await GenerateReturnVersionService.go(session, userId)
  console.log('🚀 ~ go ~ returnVersionData:', returnVersionData)

  PersistReturnVersionService.go(returnVersionData)

  return session.licence.id
}

async function _validateLicence (licenceId) {
  const licenceEnded = await CheckLicenceEndedService.go(licenceId)

  if (!licenceEnded) {
    return
  }

  throw new ExpandedError('Invalid licence for return requirements', { licenceId, licenceEnded })
}

module.exports = {
  go
}
