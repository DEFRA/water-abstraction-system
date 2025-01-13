'use strict'

/**
 * Handles the user submission for the `/return-logs/setup/{sessionId}/start` page
 * @module SubmitStartService
 */

const SessionModel = require('../../../models/session.model.js')
const StartPresenter = require('../../../presenters/return-logs/setup/start.presenter.js')
const StartValidator = require('../../../validators/return-logs/setup/start.validator.js')

/**
 * Handles the user submission for the `/return-log-edit/{sessionId}/start` page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An object with a `whatToDo:` property if there are no errors else the page data for
 * the abstraction return page including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = StartPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.whatToDo = payload.whatToDo

  return session.$update()
}

function _validate(payload) {
  const validation = StartValidator.go(payload)

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
