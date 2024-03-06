'use strict'

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/year` page
 * @module SubmitYearService
 */

const YearPresenter = require('../../../presenters/bill-runs/create/year.presenter.js')
const YearValidator = require('../../../validators/bill-runs/create/year.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/year` page
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
 * @returns {Promise<Object>} The page data for the year page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return { journeyComplete: ['2024', '2023'].includes(session.data.year) }
  }

  const formattedData = YearPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.year = payload.year

  return session.$query().patch({ data: currentData })
}

function _validate (payload, regions) {
  const validation = YearValidator.go(payload, regions)

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
