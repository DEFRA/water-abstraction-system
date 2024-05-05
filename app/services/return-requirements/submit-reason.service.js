'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/reason` page
 * @module SubmitReasonService
 */

const FetchSessionService = require('./fetch-session.service.js')
const ReasonPresenter = require('../../presenters/return-requirements/reason.presenter.js')
const ReasonValidator = require('../../validators/return-requirements/reason.validator.js')

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
  const session = await FetchSessionService.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkYourAnswersVisited: session.checkYourAnswersVisited
    }
  }

  const formattedData = ReasonPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.checkYourAnswersVisited,
    error: validationResult,
    pageTitle: 'Select the reason for the requirements for returns',
    ...formattedData
  }
}

async function _save (session, payload) {
  session.reason = payload.reason

  return session.update()
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
