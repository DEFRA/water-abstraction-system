'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/setup` page
 * @module SubmitSetupService
 */

const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
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
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} If no errors a the url for where the user should be redirected else the page data for the
 * setup page including the validation error details
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const existingData = await FetchReturnRequirementsService.go(session.licence.id)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirect: _redirect(payload.setup)
    }
  }

  const formattedData = SetupPresenter.go(session, existingData)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'How do you want to set up the requirements for returns?',
    ...formattedData
  }
}

function _redirect (setup) {
  let endpoint

  if (setup === 'use-abstraction-data') {
    endpoint = 'check'
  }

  if (setup === 'use-existing-requirements') {
    endpoint = 'existing'
  }

  if (setup === 'set-up-manually') {
    endpoint = 'purpose/0'
  }

  return endpoint
}

async function _save (session, payload) {
  session.setup = payload.setup

  return session.$update()
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
