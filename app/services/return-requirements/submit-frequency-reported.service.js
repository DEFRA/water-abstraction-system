'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/frequency-reported` page
 * @module SubmitFrequencyReportedService
 */

const FrequencyReportedPresenter = require('../../presenters/return-requirements/frequency-reported.presenter.js')
const FrequencyReportedValidator = require('../../validators/return-requirements/frequency-reported.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/frequency-reported` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the frequency reported page including the validation error details
 */
async function go (sessionId, requirementIndex, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = FrequencyReportedPresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select how often readings or volumes are reported',
    ...formattedData
  }
}

async function _save (session, requirementIndex, payload) {
  session.requirements[requirementIndex].frequencyReported = payload.frequencyReported

  return session.$update()
}

function _validate (payload) {
  const validation = FrequencyReportedValidator.go(payload)

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
