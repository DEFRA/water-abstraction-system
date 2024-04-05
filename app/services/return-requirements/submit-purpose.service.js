'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/purpose` page
 * @module SubmitPurposeService
 */

const FetchPurposesService = require('../../services/return-requirements/fetch-purposes.service.js')
const PurposeValidation = require('../../validators/return-requirements/purpose.validator.js')
const SelectPurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/purpose` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the start date page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const purposesData = await FetchPurposesService.go(session.data.licence.id)
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = SelectPurposePresenter.go(session, purposesData, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.purposes = payload.purposes

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = PurposeValidation.go(payload)

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
