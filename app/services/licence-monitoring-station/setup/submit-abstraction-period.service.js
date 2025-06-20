'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module SubmitAbstractionPeriodService
 */

const AbstractionPeriodPresenter = require('../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js')
const AbstractionPeriodValidator = require('../../../validators/licence-monitoring-station/setup/abstraction-period.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = AbstractionPeriodPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  // TODO: Update session with abstraction period before saving
  return session.$update()
}

function _validate(payload) {
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
