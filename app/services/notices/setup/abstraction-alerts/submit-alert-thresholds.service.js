'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @module SubmitAlertThresholdsService
 */

const AlertThresholdsPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js')
const AlertThresholdsValidator = require('../../../../validators/notices/setup/abstraction-alerts/alert-thresholds.validator.js')
const SessionModel = require('../../../../models/session.model.js')

const ALERT_THRESHOLDS_KEY = 'alert-thresholds'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.alertThresholds = []

  const pageData = AlertThresholdsPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

/**
 * When a single point is checked by the user, it returns as a string. When multiple alert thresholds are checked, the
 * 'alert-thresholds' is returned as an array. This function works to make those single selected string 'alert-thresholds' into an array
 * for uniformity.
 *
 * @private
 */
function _handleOneOptionSelected(payload) {
  if (!Array.isArray(payload[ALERT_THRESHOLDS_KEY])) {
    payload[ALERT_THRESHOLDS_KEY] = [payload[ALERT_THRESHOLDS_KEY]]
  }
}

async function _save(session, payload) {
  session.alertThresholds = payload[ALERT_THRESHOLDS_KEY]

  return session.$update()
}

function _validate(payload) {
  const validation = AlertThresholdsValidator.go(payload)

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
