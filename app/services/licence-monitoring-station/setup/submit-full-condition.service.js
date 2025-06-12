'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module SubmitFullConditionService
 */

const FullConditionService = require('../../../services/licence-monitoring-station/setup/full-condition.service.js')
const FullConditionValidator = require('../../../validators/licence-monitoring-station/setup/full-condition.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    const session = await SessionModel.query().findById(sessionId)
    await _save(session, payload)

    // If the user selected a non-condition option then they will proceed to the "enter abstraction period" page.
    // Ordinarily we would also return `checkPageVisited` to say whether the user should be forwarded there; however,
    // if the user has selected a condition option then they've reached the end of the journey so will go to the check
    // page, and if they selected a non-condition option then they must enter an abstraction period no matter what.
    // We therefore don't care about `checkPageVisited` on this particular page.
    return {
      abstractionPeriod: payload.condition === 'not_listed' || payload.condition === 'no_conditions'
    }
  }

  const pageData = await FullConditionService.go(sessionId)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validation = FullConditionValidator.go(payload)

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
