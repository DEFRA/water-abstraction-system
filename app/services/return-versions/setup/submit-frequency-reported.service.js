'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/frequency-reported` page
 * @module SubmitFrequencyReportedService
 */

const FrequencyReportedPresenter = require('../../../presenters/return-versions/setup/frequency-reported.presenter.js')
const FrequencyReportedValidator = require('../../../validators/return-versions/setup/frequency-reported.validator.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/frequency-reported` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the frequency reported page including the validation error details
 */
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = FrequencyReportedPresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].frequencyReported = payload.frequencyReported

  return session.$update()
}

function _validate(payload) {
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
