'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/check-your-answers` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress. It then fetches licence data.
 * Once licence data has been retrieved we use CheckLicenceEndedService to check if it's either lapsed, expired or revoked.
 * We throw an error which will be logged caught by Hapi. The user will see the regular error page.
 *
 * @param {string} sessionId - The id of the current session
 *
 * @returns {string} The licence id
 */
const CheckLicenceEndedService = require('./check-licence-ended.service.js')
const SessionModel = require('../../models/session.model.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const ExpandedError = require('../../errors/expanded.error.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const licenceData = await FetchLicenceService.go(session.data.licence.id)
  const isLicenceEnded = await CheckLicenceEndedService.checkLicenceEnded(licenceData)

  if (isLicenceEnded) {
    throw new ExpandedError('Invalid return requirement', { licenceData })
  }

  return licenceData.id
}

module.exports = {
  go
}
