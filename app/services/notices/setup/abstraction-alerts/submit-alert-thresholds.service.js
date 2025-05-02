'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @module SubmitAlertThresholdsService
 */

const AlertThresholdsPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js')
const AlertThresholdsValidator = require('../../../../validators/notices/setup/abstraction-alerts/alert-thresholds.validator.js')
const SessionModel = require('../../../../models/session.model.js')

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

async function _save(session, payload) {
  session.alertThresholds = Array.isArray(payload['alert-thresholds'])
    ? payload['alert-thresholds']
    : [payload['alert-thresholds']]

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
