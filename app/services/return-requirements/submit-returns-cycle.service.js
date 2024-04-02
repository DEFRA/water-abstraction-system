'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/returns-cycle` page
 * @module SubmitReturnsCycleService
 */

const ReturnsCyclePresenter = require('../../presenters/return-requirements/returns-cycle.presenter.js')
const ReturnsCycleValidator = require('../../validators/return-requirements/returns-cycle.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/returns-cycle` page
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
 * @returns {Promise<Object>} The page data for the returns cycle page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)
  const formattedData = ReturnsCyclePresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the returns cycle for the requirements for returns',
    ...formattedData
  }
}

function _validate (payload) {
  const validation = ReturnsCycleValidator.go(payload)

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
