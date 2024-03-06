'use strict'

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/season` page
 * @module SubmitSeasonService
 */

const SessionModel = require('../../../models/session.model.js')
const SeasonPresenter = require('../../../presenters/bill-runs/create/season.presenter.js')
const SeasonValidator = require('../../../validators/bill-runs/create/season.validator.js')

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/season` page
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
 * @returns {Promise<Object>} The page data for the season page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = SeasonPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.season = payload.season

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = SeasonValidator.go(payload)

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
