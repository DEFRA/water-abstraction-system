'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/frequency-collected` page
 * @module SubmitFrequencyCollectedService
 */

const FrequencyCollectedPresenter = require('../../presenters/return-requirements/frequency-collected.presenter.js')
const FrequencyCollectedValidator = require('../../validators/return-requirements/frequency-collected.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/frequency-collected` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the frequency collected page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = FrequencyCollectedPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select how often readings or volumes are collected',
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.frequencyCollected = payload.frequencyCollected

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = FrequencyCollectedValidator.go(payload)

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
