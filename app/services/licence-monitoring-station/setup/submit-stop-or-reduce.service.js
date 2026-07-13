/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module SubmitStopOrReduceService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import StopOrReducePresenter from '../../../presenters/licence-monitoring-station/setup/stop-or-reduce.presenter.js'
import StopOrReduceValidator from '../../../validators/licence-monitoring-station/setup/stop-or-reduce.validator.js'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
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

  return StopOrReducePresenter(session)
}

function _validate(payload) {
  const validation = StopOrReduceValidator(payload)

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
