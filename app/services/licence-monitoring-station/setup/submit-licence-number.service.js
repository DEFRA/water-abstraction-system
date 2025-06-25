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

  const licence = await _fetchLicence(payload.licenceRef)

  const validationResult = await _validate(payload, licence)

  if (!validationResult) {
    await _save(session, payload, licence)

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const pageData = LicenceNumberPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
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
