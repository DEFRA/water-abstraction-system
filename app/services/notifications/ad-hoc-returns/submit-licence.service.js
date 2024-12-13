'use strict'

/**
 * Orchestrates validating the data for `/notifications/ad-hoc-returns/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')
const LicencePresenter = require('../../../presenters/notifications/ad-hoc-returns/licence.presenter.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notifications/ad-hoc-returns/{sessionId}/licence` page
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
  const formattedData = LicencePresenter.go(session)

  if (validationResult) {
    return {
      error: validationResult,
      ...formattedData
    }
  }

  const dueReturns = await _fetchDueReturns(payload.licenceRef)
  if (!dueReturns) {
    return {
      notification: `There are no returns due for licence ${payload.licenceRef}`,
      ...formattedData
    }
  }

  await _save(session, payload)
  return {}
}

async function _fetchDueReturns(licenceRef) {
  const dueReturns = await ReturnLogModel.query().where('licenceRef', licenceRef).where('status', 'due').first()

  return !!dueReturns
}

async function _fetchLicence(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).first()

  return !!licence
}

async function _save(session, payload) {
  session.licenceRef = payload.licenceRef

  return session.$update()
}

async function _validate(payload) {
  if (payload.licenceRef) {
    const licenceExists = await _fetchLicence(payload.licenceRef)

    if (licenceExists) {
      return null
    }
  }

  return {
    text: 'Enter a Licence number'
  }
}

module.exports = {
  go
}
