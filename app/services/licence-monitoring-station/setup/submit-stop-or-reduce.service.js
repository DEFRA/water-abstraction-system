'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module SubmitStopOrReduceService
 */

const SessionModel = require('../../../models/session.model.js')
const StopOrReducePresenter = require('../../../presenters/licence-monitoring-station/setup/stop-or-reduce.presenter.js')
const StopOrReduceValidator = require('../../../validators/licence-monitoring-station/setup/stop-or-reduce.validator.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
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

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.stopOrReduce = payload.stopOrReduce
  session.reduceAtThreshold = payload.reduceAtThreshold ?? null

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.stopOrReduce = payload.stopOrReduce ?? null
  session.reduceAtThreshold = payload.reduceAtThreshold ?? null

  return StopOrReducePresenter.go(session)
}

function _validate(payload) {
  const validation = StopOrReduceValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message, path } = validation.error.details[0]

  const result = {
    message,
    reduceAtThresholdRadioElement: path[0] === 'reduceAtThreshold' ? { text: message } : null,
    stopOrReduceRadioElement: path[0] === 'stopOrReduce' ? { text: message } : null
  }

  return result
}

module.exports = {
  go
}
