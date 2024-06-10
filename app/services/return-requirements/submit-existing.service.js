'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/existing` page
 * @module SubmitExistingService
 */

const ExistingPresenter = require('../../presenters/return-requirements/existing.presenter.js')
const ExistingValidator = require('../../validators/return-requirements/existing.validator.js')
const FetchExistingRequirementsService = require('./fetch-existing-requirements.service.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/existing` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey after the existing return requirements have been saved to
 * the session.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} If no errors an empty object else the page data for the existing page including the
 * validation error details
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session)

  if (!validationResult) {
    const existingReturnRequirements = await FetchExistingRequirementsService.go(payload.existing)

    await _save(session, existingReturnRequirements)

    return {}
  }

  const formattedData = ExistingPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select an existing requirements for returns from',
    ...formattedData
  }
}

async function _save (session, existingReturnRequirements) {
  session.requirements = existingReturnRequirements

  return session.$update()
}

function _validate (payload, session) {
  const { licence: { returnVersions } } = session

  const validation = ExistingValidator.go(payload, returnVersions)

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
