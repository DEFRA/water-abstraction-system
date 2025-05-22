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

  const validationResult = await _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = LicenceNumberPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _licenceExists(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').first()

  return !!licence
}

async function _save(session, payload) {
  session.licenceRef = payload.licenceRef
  return session.$update()
}

async function _validate(payload) {
  let licenceExists = false

  if (payload.licenceRef) {
    licenceExists = await _licenceExists(payload.licenceRef)
  }

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
