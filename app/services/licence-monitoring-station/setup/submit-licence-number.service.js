'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @module SubmitLicenceNumberService
 */

const LicenceModel = require('../../../models/licence.model.js')
const LicenceNumberPresenter = require('../../../presenters/licence-monitoring-station/setup/licence-number.presenter.js')
const LicenceNumberValidator = require('../../../validators/licence-monitoring-station/setup/licence-number.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const licence = payload.licenceRef ? await _fetchLicence(payload.licenceRef) : null

  const validationResult = await _validate(payload, licence)

  if (!validationResult) {
    // If the submitted licence ref is different to what we already have in the session then all the info on the
    // following pages (condition and abstraction period) is invalid, so we ensure the checkPageVisited flag is false
    // and save the new values to the session.
    if (payload.licenceRef !== session.licenceRef) {
      session.checkPageVisited = false
      await _save(session, payload, licence)
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _fetchLicence(licenceRef) {
  return LicenceModel.query().where('licenceRef', licenceRef).select('id', 'licenceRef').first()
}

async function _save(session, payload, licence) {
  session.licenceId = licence.id
  session.licenceRef = payload.licenceRef

  await session.$update()
}

function _submittedSessionData(session, payload) {
  session.licenceRef = payload['licenceRef'] ?? null

  return LicenceNumberPresenter.go(session)
}

async function _validate(payload, licence) {
  const licenceExists = !!licence

  const validation = LicenceNumberValidator.go(payload, licenceExists)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
