'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @module SubmitLicencesService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const LicencesPresenter = require('../../../presenters/company-contacts/setup/licences.presenter.js')
const LicencesValidator = require('../../../validators/company-contacts/setup/licences.validator.js')
const { checkUrl } = require('../../../lib/check-page.lib.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/company-contacts/setup/${sessionId}/check`)
    }
  }

  const pageData = LicencesPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = LicencesValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
