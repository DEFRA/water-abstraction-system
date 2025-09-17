'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

const FetchReturnsDueByLicenceRefService = require('./fetch-returns-due-by-licence-ref.service.js')
const GeneralLib = require('../../../lib/general.lib.js')
const LicenceModel = require('../../../models/licence.model.js')
const LicencePresenter = require('../../../presenters/notices/setup/licence.presenter.js')
const LicenceValidator = require('../../../validators/notices/setup/licence.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return an error to the user informing them that there are no due returns the
 * licence.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the licence page including
 * the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = await _validate(payload)

  if (!validationResult) {
    if (session.checkPageVisited && payload.licenceRef !== session.licenceRef) {
      GeneralLib.flashNotification(yar, 'Updated', 'Licence number updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return {
      redirectUrl: _redirect(session.checkPageVisited)
    }
  }

  session.licenceRef = payload.licenceRef

  const pageData = LicencePresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

async function _dueReturnsExist(licenceRef) {
  const dueReturns = await FetchReturnsDueByLicenceRefService.go(licenceRef)

  return dueReturns.length > 0
}

async function _licenceExists(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').first()

  return !!licence
}

async function _save(session, payload) {
  session.licenceRef = payload.licenceRef

  session.dueReturns = await FetchReturnsDueByLicenceRefService.go(payload.licenceRef)

  return session.$update()
}

function _redirect(checkPageVisited) {
  if (checkPageVisited) {
    return 'check-notice-type'
  }

  return 'notice-type'
}

async function _validate(payload) {
  let licenceExists = false
  let dueReturns = false

  if (payload.licenceRef) {
    licenceExists = await _licenceExists(payload.licenceRef)
    dueReturns = await _dueReturnsExist(payload.licenceRef)
  }

  const validationResult = LicenceValidator.go(payload, licenceExists, dueReturns)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
