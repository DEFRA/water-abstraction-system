'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/agreements-exceptions` page
 * @module SubmitAgreementsExceptions
 */

const AgreementsExceptionsPresenter = require('../../presenters/return-requirements/agreements-exceptions.presenter.js')
const AgreementsExceptionsValidator = require('../../validators/return-requirements/agreements-exceptions.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/agreements-exceptions` page
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
 * @returns {Promise<Object>} The page data for the agreements and exceptions page
 */
async function go (sessionId, payload) {
  console.log('🚀🚀🚀 ~ payload:', payload)
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = AgreementsExceptionsPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select agreements and exceptions for the requirements for returns',
    ...formattedData
  }
}

/**
 * When a single agreement and exception is checked by the user, it returns as a string. When multiple agreements and exceptions are checked, the
 * 'agreementsExceptions' is returned as an array. This function works to make those single selected string 'agreementsExceptions' into an array
 * for uniformity.
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.agreementsExceptions)) {
    payload.agreementsExceptions = [payload.agreementsExceptions]
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.agreementsExceptions = payload.agreementsExceptions

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = AgreementsExceptionsValidator.go(payload)

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
