'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/meter-provided` page
 * @module SubmitMeterProvidedService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const GeneralLib = require('../../../lib/general.lib.js')
const MeterProvidedPresenter = require('../../../presenters/return-logs/setup/meter-provided.presenter.js')
const MeterProvidedValidator = require('../../../validators/return-logs/setup/meter-provided.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/meter-provided` page
 *
 * It first retrieves the session instance for the return log setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the meter-provided page else the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited && payload.meterProvided === 'no') {
      GeneralLib.flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited,
      meterProvided: session.meterProvided,
      reported: session.reported
    }
  }

  const pageData = MeterProvidedPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  if (payload.meterProvided === 'no') {
    session.meterMake = null
    session.meterSerialNumber = null
    session.meter10TimesDisplay = null
  }

  session.meterProvided = payload.meterProvided

  return session.$update()
}

function _validate(payload) {
  const validationResult = MeterProvidedValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
