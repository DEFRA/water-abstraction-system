'use strict'

/**
 * Orchestrates validating the data for `` page
 *
 * @module SubmitStopOrReduceService
 */

const StopOrReducePresenter = require('../../../presenters/licence-monitoring-station/setup/stop-or-reduce.presenter.js')
const StopOrReduceValidator = require('../../../validators/licence-monitoring-station/setup/stop-or-reduce.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `` page
 *
 * @param {string} sessionId
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

  const pageData = StopOrReducePresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validation = StopOrReduceValidator.go(payload)

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
