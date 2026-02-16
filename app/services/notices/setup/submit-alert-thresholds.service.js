'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module SubmitAlertThresholdsService
 */

const AlertThresholdsPresenter = require('../../../presenters/notices/setup/alert-thresholds.presenter.js')
const AlertThresholdsValidator = require('../../../validators/notices/setup/alert-thresholds.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const { handleOneOptionSelected } = require('../../../lib/submit-page.lib.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  handleOneOptionSelected(payload, 'alertThresholds')

  session.alertThresholds = payload.alertThresholds

  const error = _validate(payload)

  if (!error) {
    await _save(session)

    return {}
  }

  const pageData = AlertThresholdsPresenter.go(session)

  return {
    error,
    ...pageData
  }
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = AlertThresholdsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
