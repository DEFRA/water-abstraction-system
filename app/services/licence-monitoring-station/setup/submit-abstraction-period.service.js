/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module SubmitAbstractionPeriodService
 */

import { formatValidationResult } from '../../../presenters/base.presenter.js'

import AbstractionPeriodPresenter from '../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js'
import AbstractionPeriodValidator from '../../../validators/abstraction-period.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

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
