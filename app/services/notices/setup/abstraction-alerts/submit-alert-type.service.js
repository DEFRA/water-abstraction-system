'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module SubmitAlertTypeService
 */

const AlertTypePresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-type.presenter.js')
const AlertTypeValidator = require('../../../../validators/notices/setup/abstraction-alerts/alert-type.validator.js')
const SessionModel = require('../../../../models/session.model.js')

const ALERT_TYPE_KEY = 'alert-type'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session.licenceMonitoringStations)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.alertType = payload[ALERT_TYPE_KEY]

  const pageData = AlertTypePresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  if (session.alertType !== payload[ALERT_TYPE_KEY]) {
    session.alertThresholds = []
  }

  session.alertType = payload[ALERT_TYPE_KEY]

  return session.$update()
}

function _validate(payload, licenceMonitoringStations) {
  const validation = AlertTypeValidator.go(payload, licenceMonitoringStations)

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
