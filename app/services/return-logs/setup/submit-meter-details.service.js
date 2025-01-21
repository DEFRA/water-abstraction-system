'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/meter-details` page
 * @module SubmitMeterDetailsService
 */

const SessionModel = require('../../../models/session.model.js')
const MeterDetailsPresenter = require('../../../presenters/return-logs/setup/meter-details.presenter.js')
const MeterDetailsValidator = require('../../../validators/return-logs/setup/meter-details.validator.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/meter-details` page
 *
 * It first retrieves the session instance for the return log setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the meter-details page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = MeterDetailsPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.meterMake = payload.meterMake
  session.meterSerialNumber = payload.meterSerialNumber
  session.meter10TimesDisplay = payload.meter10TimesDisplay

  return session.$update()
}

function _validate(payload) {
  const validation = MeterDetailsValidator.go(payload)
  const { meterSerialNumberResult, meterMakeResult, meter10TimesDisplayResult } = validation

  if (!meterSerialNumberResult.error && !meterMakeResult.error && !meter10TimesDisplayResult.error) {
    return null
  }

  return {
    text: {
      meterMakeResult: meterMakeResult.error ? meterMakeResult.error.details[0].message : null,
      meterSerialNumberResult: meterSerialNumberResult.error ? meterSerialNumberResult.error.details[0].message : null,
      meter10TimesDisplayResult: meter10TimesDisplayResult.error
        ? meter10TimesDisplayResult.error.details[0].message
        : null
    }
  }
}

module.exports = {
  go
}
