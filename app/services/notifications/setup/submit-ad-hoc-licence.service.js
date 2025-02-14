'use strict'

/**
 * Orchestrates validating the data for `/notifications/setup/{sessionId}/ad-hoc-licence` page
 * @module SubmitAdHocLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')
const AdHocLicencePresenter = require('../../../presenters/notifications/setup/ad-hoc-licence.presenter.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')
const AdHocLicenceValidator = require('../../../validators/notifications/setup/ad-hoc-licence.validator.js')

/**
 * Orchestrates validating the data for `/notifications/setup/{sessionId}/ad-hoc-licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return a notification to the user informing them that there are no due returns.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the licence page including
 * the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = await _validate(payload)

  const formattedData = AdHocLicencePresenter.go(payload.licenceRef, session.referenceCode)

  if (validationResult) {
    return {
      activeNavBar: 'manage',
      error: validationResult,
      ...formattedData
    }
  }

  await _save(session, payload)

  return {}
}

async function _dueReturnsExist(licenceRef) {
  const dueReturns = await ReturnLogModel.query().where('licenceRef', licenceRef).where('status', 'due').first()

  return !!dueReturns
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
  let dueReturns = false

  if (payload.licenceRef) {
    licenceExists = await _licenceExists(payload.licenceRef)
    dueReturns = await _dueReturnsExist(payload.licenceRef)
  }

  const validation = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

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
