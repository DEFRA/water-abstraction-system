'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module SubmitFullConditionService
 */

const FetchFullConditionService = require('../../../services/licence-monitoring-station/setup/fetch-full-condition.service.js')
const FullConditionService = require('../../../services/licence-monitoring-station/setup/full-condition.service.js')
const FullConditionValidator = require('../../../validators/licence-monitoring-station/setup/full-condition.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    const session = await SessionModel.query().findById(sessionId)

    // We want to display the exact text of the chosen condition on the check page, including the condition number. In
    // order to determine the number we need to re-fetch the conditions for this licence. We can then save its info in
    // the session. We do this once here to avoid hitting the db every time we render the check page.
    const conditionDisplayText = await _determineConditionDisplayText(session.licenceId, payload.condition)

    await _save(session, conditionDisplayText, payload)

    // If the user selected a non-condition option then they will proceed to the "enter abstraction period" page.
    // Ordinarily we would also return `checkPageVisited` to say whether the user should be forwarded there; however,
    // if the user has selected a condition option then they've reached the end of the journey so will go to the check
    // page, and if they selected a non-condition option then they must enter an abstraction period no matter what.
    // We therefore don't care about `checkPageVisited` on this particular page.
    return {
      abstractionPeriod: payload.condition === 'not_listed'
    }
  }

  const pageData = await FullConditionService.go(sessionId)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _determineConditionDisplayText(licenceId, conditionId) {
  if (conditionId === 'not_listed') {
    return 'None'
  }

  const conditions = await FetchFullConditionService.go(licenceId)

  const conditionIndex = conditions.findIndex((condition) => {
    return condition.id === conditionId
  })

  const condition = conditions[conditionIndex]

  // Construct the display text in the format we want, eg:
  // 'Flow cessation condition 2: DESCRIPTION (Additional information 1: INFO_1) (Additional information 2: INFO_2)'
  // or if no description is provided: 'Flow cessation condition 2 (Additional information 1: INFO_1)' etc.
  return [
    condition.displayTitle,
    ` ${conditionIndex + 1}`,
    condition.notes ? `: ${condition.notes}` : ' ',
    ` (Additional information 1: ${condition.param1 || 'None'})`,
    ` (Additional information 2: ${condition.param2 || 'None'})`
  ].join('')
}

async function _save(session, conditionDisplayText, payload) {
  session.conditionId = payload.condition
  session.conditionDisplayText = conditionDisplayText

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
