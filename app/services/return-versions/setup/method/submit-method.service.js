'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/method` page
 * @module SubmitSetupService
 */

const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

const GenerateFromAbstractionDataService = require('./generate-from-abstraction-data.service.js')
const SessionModel = require('../../../../models/session.model.js')
const MethodPresenter = require('../../../../presenters/return-versions/setup/method.presenter.js')
const MethodValidator = require('../../../../validators/return-versions/setup/method.validator.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/method` page
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
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirect: _redirect(payload.method)
    }
  }

  const formattedData = MethodPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

function _redirect(method) {
  if (method === 'useAbstractionData') {
    return 'check'
  }

  if (method === 'useExistingRequirements') {
    return 'existing'
  }

  return 'purpose/0'
}

async function _save(session, payload) {
  session.method = payload.method

  // If the user selected the method 'Start by using abstraction data' to setup the return requirements we use
  // `GenerateFromAbstractionDataService` to fetch the licence's abstraction data and transform it into return
  // requirements we can persist in the session
  if (payload.method === 'useAbstractionData') {
    session.requirements = await GenerateFromAbstractionDataService.go(
      session.licence.id,
      session.licenceVersion.id,
      session.returnVersionStartDate
    )
  }

  return session.$update()
}

function _validate(payload) {
  const validation = MethodValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
