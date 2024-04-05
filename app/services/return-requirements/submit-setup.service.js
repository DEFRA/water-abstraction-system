'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/setup` page
 * @module SubmitSetupService
 */

const SessionModel = require('../../models/session.model.js')
const SetupPresenter = require('../../presenters/return-requirements/setup.presenter.js')
const SetupValidator = require('../../validators/return-requirements/setup.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/setup` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey depending on which radio item was chosen.
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
      redirect: _redirect(payload.setup)
    }
  }

  const formattedData = SetupPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'How do you want to set up the return requirement?',
    ...formattedData
  }
}

function _redirect (setup) {
  let endpoint

  if (setup === 'use_abstraction_data') {
    endpoint = 'check-your-answers'
  }

  if (setup === 'set_up_manually') {
    endpoint = 'purpose'
  }

  return endpoint
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.setup = payload.setup

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = SetupValidator.go(payload)

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
