'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/method` page
 * @module SubmitSetupService
 */

const GenerateFromAbstractionDataService = require('./generate-from-abstraction-data.service.js')
const SessionModel = require('../../../models/session.model.js')
const MethodPresenter = require('../../../presenters/return-requirements/method.presenter.js')
const SetupValidator = require('../../../validators/return-requirements/setup.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/method` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey depending on which radio item was chosen.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors a the url for where the user should be redirected else the page data for the
 * setup page including the validation error details
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

  const formattedData = MethodPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'How do you want to set up the requirements for returns?',
    ...formattedData
  }
}

function _redirect (setup) {
  if (setup === 'use-abstraction-data') {
    return 'check'
  }

  if (setup === 'use-existing-requirements') {
    return 'existing'
  }

  return 'purpose/0'
}

async function _save (session, payload) {
  session.setup = payload.setup

  // If the user selected the option to use abstraction data to setup the return requirements we use
  // GenerateFromAbstractionDataService to fetch the licence's abstraction data and transform it into return
  // requirements we can persist in the session
  if (payload.setup === 'use-abstraction-data') {
    session.requirements = await GenerateFromAbstractionDataService.go(session.licence.id)
  }

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
