'use strict'
/**
 * Manages converting the session data to return requirement records when check your answers is confirmed
 * @module SubmitCheckYoursAnswersService
 */

const CheckLicenceEndedService = require('./check-licence-ended.service.js')
const ExpandedError = require('../../errors/expanded.error.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Manages converting the session data to return requirement records when check your answers is confirmed
 * 
 * > This service is work in progress. Some of the functionality described is yet to be implemented
 * 
 * After fetching the session instance for the returns requirements journey in progress it validates that what the user
 * has setup can be persisted for the licence.
 * 
 * If valid it converts the session data to return requirements records then deletes the session record.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {string} The licence ID
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const licenceData = await CheckLicenceEndedService.go(session.data.licence.id)
  const isLicenceEnded = await licenceData.ended

  if (isLicenceEnded) {
    throw new ExpandedError('Invalid return requirement', { licenceData })
  }

  return licenceData.id
}

module.exports = {
  go
}
