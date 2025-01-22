'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/meter-details` page
 * @module SubmitMeterDetailsService
 */

const MeterDetailsPresenter = require('../../../presenters/return-logs/setup/meter-details.presenter.js')
const MeterDetailsValidator = require('../../../validators/return-logs/setup/meter-details.validator.js')
const SessionModel = require('../../../models/session.model.js')

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

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...submittedSessionData
  }
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter. If nothing is submitted by
 * the user, payload will be an empty object.
 *
 * @private
 */
function _submittedSessionData(session, payload) {
  session.meterMake = payload.meterMake ?? null
  session.meterSerialNumber = payload.meterSerialNumber ?? null
  session.meter10TimesDisplay = payload.meter10TimesDisplay ?? null

  return MeterDetailsPresenter.go(session)
}

async function _save(session, payload) {
  session.meterMake = payload.meterMake
  session.meterSerialNumber = payload.meterSerialNumber
  session.meter10TimesDisplay = payload.meter10TimesDisplay

  return session.$update()
}

function _validate(payload) {
  const validation = MeterDetailsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    let href

    if (detail.context.key === 'meterMake') {
      href = '#meter-make'
    } else if (detail.context.key === 'meterSerialNumber') {
      href = '#meter-serial-number'
    } else {
      href = '#meter-10-times-display'
    }

    result.errorList.push({
      href,
      text: detail.message
    })

    result[detail.context.key] = { message: detail.message }
  })

  return result
}

module.exports = {
  go
}
