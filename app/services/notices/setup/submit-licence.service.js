'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

const FetchDueReturnsForLicenceService = require('./returns-notice/fetch-due-returns-for-licence.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const LicencePresenter = require('../../../presenters/notices/setup/licence.presenter.js')
const LicenceValidator = require('../../../validators/notices/setup/licence.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const { compareDates } = require('../../../lib/dates.lib.js')
const { flashNotification } = require('../../../lib/general.lib.js')

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

  const dueReturns = await _dueReturns(payload)

  const validationResult = await _validate(payload, dueReturns)

  if (!validationResult) {
    if (session.checkPageVisited && payload.licenceRef !== session.licenceRef) {
      flashNotification(yar, 'Updated', 'Licence number updated')

      session.checkPageVisited = false
    }

    await _save(session, payload, dueReturns)

    return {
      redirectUrl: _redirect(session.checkPageVisited)
    }
  }

  session.licenceRef = payload.licenceRef

  const pageData = LicencePresenter.go(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

async function _dueReturns(payload) {
  if (!payload.licenceRef) {
    return []
  }

  return FetchDueReturnsForLicenceService.go(payload.licenceRef)
}

function _latestDueDate(dueReturnLogs) {
  let latestDueDate

  for (const dueReturnLog of dueReturnLogs) {
    // If we encounter a return log with no due date, then will calculate the due date from the current date when we
    // send the notice
    if (!dueReturnLog.dueDate) {
      latestDueDate = null
      break
    }

    // If latestDueDate has not yet been set, or it has been and the current return log's due date is later than it,
    // then set latestDueDate to the current return log's due date
    if (!latestDueDate || compareDates(dueReturnLog.dueDate, latestDueDate) === 1) {
      latestDueDate = dueReturnLog.dueDate
    }
  }

  return latestDueDate
}

async function _licenceExists(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').first()

  return !!licence
}

async function _save(session, payload, dueReturns) {
  session.licenceRef = payload.licenceRef

  session.dueReturns = dueReturns
  session.latestDueDate = _latestDueDate(dueReturns)

  return session.$update()
}

function _redirect(checkPageVisited) {
  if (checkPageVisited) {
    return 'check-notice-type'
  }

  return 'notice-type'
}

async function _validate(payload, dueReturns) {
  const dueReturnsExist = dueReturns.length > 0

  let licenceExists = false

  if (payload.licenceRef) {
    licenceExists = await _licenceExists(payload.licenceRef)
  }

  const validationResult = LicenceValidator.go(payload, licenceExists, dueReturnsExist)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
