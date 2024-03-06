'use strict'

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/type` page
 * @module SubmitTypeService
 */

const SessionModel = require('../../../models/session.model.js')
const TypePresenter = require('../../../presenters/bill-runs/create/type.presenter.js')
const TypeValidator = require('../../../validators/bill-runs/create/type.validator.js')

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/type` page
 *
 * It first retrieves the session instance for the create bill run journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the type page
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
