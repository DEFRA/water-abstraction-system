'use strict'

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/type` page
 * @module SubmitTypeService
 */

const SessionModel = require('../../../models/session.model.js')
const TypePresenter = require('../../../presenters/bill-runs/setup/type.presenter.js')
const TypeValidator = require('../../../validators/bill-runs/setup/type.validator.js')

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/type` page
 *
 * It first retrieves the session instance for the setup bill run journey in progress. It then validates the payload of
 * the submitted request.
 *
 * If there is no validation error it will save the selected value to the session then return an empty object. This will
 * indicate to the controller that the submission was successful triggering it to redirect to the next page in the
 * journey.
 *
 * If there is a validation error it is combined with the output of the presenter to generate the page data needed to
 * re-render the view with an error message.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} An empty object if there are no errors else the page data for the type page including the
 * validation error details
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = TypePresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.type = payload.type

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = TypeValidator.go(payload)

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
