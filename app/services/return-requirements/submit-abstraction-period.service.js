'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/abstraction-period` page
 * @module SubmitAbstractionPeriodService
 */

const AbstractionPeriodPresenter = require('../../presenters/return-requirements/abstraction-period.presenter.js')
const AbstractionPeriodValidator = require('../../validators/return-requirements/abstraction-period.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/abstraction-period` page
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
 * @returns {Promise<Object>} The page data for the abstraction period page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = AbstractionPeriodPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Enter the abstraction period for the requirements for returns',
    ...formattedData
  }
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.abstractionPeriod = payload

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = AbstractionPeriodValidator.go(payload)

  if (!validation.startResult.error && !validation.endResult.error) {
    return null
  }

  const startResult = validation.startResult.error ? validation.startResult.error.details[0].message : null
  const endResult = validation.endResult.error ? validation.endResult.error.details[0].message : null

  return {
    text: {
      startResult,
      endResult
    }
  }
}

module.exports = {
  go
}
