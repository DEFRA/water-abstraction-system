'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module SubmitAbstractionPeriodService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const AbstractionPeriodPresenter = require('../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js')
const AbstractionPeriodValidator = require('../../../validators/abstraction-period.validator.js')
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
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.abstractionPeriodStartDay = payload['abstraction-period-start-day']
  session.abstractionPeriodEndDay = payload['abstraction-period-end-day']
  session.abstractionPeriodStartMonth = payload['abstraction-period-start-month']
  session.abstractionPeriodEndMonth = payload['abstraction-period-end-month']

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.abstractionPeriodStartDay = payload['abstraction-period-start-day'] ?? null
  session.abstractionPeriodEndDay = payload['abstraction-period-end-day'] ?? null
  session.abstractionPeriodStartMonth = payload['abstraction-period-start-month'] ?? null
  session.abstractionPeriodEndMonth = payload['abstraction-period-end-month'] ?? null

  return AbstractionPeriodPresenter.go(session)
}

function _validate(payload) {
  const validation = AbstractionPeriodValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
