'use strict'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 * @module SubmitThresholdAndUnitService
 */

const SessionModel = require('../../../models/session.model.js')
const ThresholdAndUnitPresenter = require('../../../presenters/licence-monitoring-station/setup/threshold-and-unit.presenter.js')
const ThresholdAndUnitValidator = require('../../../validators/licence-monitoring-station/setup/threshold-and-unit.validator.js')

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 *
 * It first retrieves the session instance for the licence monitoring station setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the threshold and unit page else the validation error
 * details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  // Due to the way the page is structured with multiple threshold fields (one per unit), the validator handles
  // identifying which field contains the correct threshold value based on the unit selected. This is returned to us
  // as `valdationResult.value.threshold` (whereas in the payload it is `threshold-{unit}`) and this is how we save it
  // in the session.
  if (validationResult.value) {
    await _save(session, validationResult.value)

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  // We want the page to be re-rendered with any originally submitted threshold values (rather than the one identified
  // by the validator) hence we use payload here rather than validationResult.value
  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult.formattedError,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.threshold = Number(payload.threshold)
  session.unit = payload.unit

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.threshold = payload.threshold ?? null
  session.unit = payload.unit ?? null

  return ThresholdAndUnitPresenter.go(session)
}

function _validate(payload) {
  const validation = ThresholdAndUnitValidator.go(payload)

  if (!validation.error) {
    return { formattedError: null, value: validation.value }
  }

  const formattedError = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    let href
    if (detail.context.key === 'threshold') {
      href = '#threshold'
    } else {
      href = '#unit'
    }

    formattedError.errorList.push({
      href,
      text: detail.message
    })

    formattedError[detail.context.key] = { message: detail.message }
  })

  return { formattedError, value: null }
}

module.exports = {
  go
}
