'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/single-volume` page
 * @module SubmitSingleVolumeService
 */

const SessionModel = require('../../../models/session.model.js')
const SingleVolumePresenter = require('../../../presenters/return-logs/setup/single-volume.presenter.js')
const SingleVolumeValidator = require('../../../validators/return-logs/setup/single-volume.validator.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/single-volume` page
 *
 * It first retrieves the session instance for the return log setup session in progress. The session has details about
 * the return log that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the single-volume page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.singleVolume = payload.singleVolume
  session.singleVolumeQuantity = payload.singleVolumeQuantity

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.singleVolume = payload.singleVolume ?? null
  session.singleVolumeQuantity = payload.singleVolumeQuantity ?? null

  return SingleVolumePresenter.go(session)
}

function _validate(payload) {
  const validation = SingleVolumeValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message, type } = validation.error.details[0]

  // There are only two possible error scenarios: either a radio button has not been selected, in which case the enter
  // volume isn't visible so there cannot be an "invalid volume" error; or an invalid volume has been entered, in which
  // case the singleVolume *is* visible so there cannot be a "radio button not selected" error. We identify the former
  // by checking if the error type is `any.required`; and so if an error is present which isn't of this type, it must be
  // a input error.
  return {
    message,
    radioFormElement: type === 'any.required' ? { text: message } : null,
    volumeInputFormElement: type === 'any.required' ? null : { text: message }
  }
}

module.exports = {
  go
}
