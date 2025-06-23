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

  const formattedData = _submittedSessionData(session, payload)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.abstractionPeriod = {
    abstractionPeriodStartDay: payload['abstraction-period-start-day'],
    abstractionPeriodEndDay: payload['abstraction-period-end-day'],
    abstractionPeriodStartMonth: payload['abstraction-period-start-month'],
    abstractionPeriodEndMonth: payload['abstraction-period-end-month']
  }

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.abstractionPeriod = {
    abstractionPeriodStartDay: payload['abstraction-period-start-day'] ?? null,
    abstractionPeriodEndDay: payload['abstraction-period-end-day'] ?? null,
    abstractionPeriodStartMonth: payload['abstraction-period-start-month'] ?? null,
    abstractionPeriodEndMonth: payload['abstraction-period-end-month'] ?? null
  }

  return AbstractionPeriodPresenter.go(session)
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
