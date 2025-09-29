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
  session.abstractionPeriodEndDay = payload.abstractionPeriodEndDay
  session.abstractionPeriodEndMonth = payload.abstractionPeriodEndMonth
  session.abstractionPeriodStartDay = payload.abstractionPeriodStartDay
  session.abstractionPeriodStartMonth = payload.abstractionPeriodStartMonth

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.abstractionPeriodEndDay = payload.abstractionPeriodEndDay ?? null
  session.abstractionPeriodEndMonth = payload.abstractionPeriodEndMonth ?? null
  session.abstractionPeriodStartDay = payload.abstractionPeriodStartDay ?? null
  session.abstractionPeriodStartMonth = payload.abstractionPeriodStartMonth ?? null

  return AbstractionPeriodPresenter.go(session)
}

function _validate(payload) {
  const validation = AbstractionPeriodValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
