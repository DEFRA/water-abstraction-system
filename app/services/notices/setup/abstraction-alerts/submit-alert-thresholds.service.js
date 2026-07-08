/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module SubmitAlertThresholdsService
 */

import AlertThresholdsPresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js'
import AlertThresholdsValidator from '../../../../validators/notices/setup/alert-thresholds.validator.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'alertThresholds')

  session.alertThresholds = payload.alertThresholds

  const error = _validate(payload)

  if (!error) {
    await _save(session)

    return {}
  }

  const pageData = AlertThresholdsPresenter(session)

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
