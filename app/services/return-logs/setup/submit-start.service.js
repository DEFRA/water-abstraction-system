'use strict'

/**
 * Handles the user submission for the `/return-log-edit/{sessionId}/start` page
 * @module SubmitStartService
 */

const SessionModel = require('../../../models/session.model.js')
const StartPresenter = require('../../../presenters/return-logs/setup/start.presenter.js')

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
  const { whatToDo } = payload
  const validationResult = _validate(whatToDo)

  if (!validationResult) {
    await _save(session, whatToDo)

    return { whatToDo }
  }

  const formattedData = StartPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, whatToDo) {
  const currentData = session

  currentData.whatToDo = whatToDo

  return session.$query().patch({ data: currentData })
}

function _validate(whatToDo) {
  if (!whatToDo) {
    return { text: 'Select what you want to do with this return' }
  }

  return null
}

module.exports = {
  go
}
