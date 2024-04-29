'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/reason` page
 * @module SubmitReasonService
 */

const ReasonPresenter = require('../../presenters/return-requirements/reason.presenter.js')
const ReasonValidator = require('../../validators/return-requirements/reason.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/reason` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the reason page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkYourAnswersVisited: session.data.checkYourAnswersVisited
    }
  }

  const formattedData = ReasonPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.data.checkYourAnswersVisited,
    error: validationResult,
    pageTitle: 'Select the reason for the return requirement',
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.reason = payload.reason

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = ReasonValidator.go(payload)

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
