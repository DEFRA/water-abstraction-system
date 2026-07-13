/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module SubmitAlertTypeService
 */

import AlertTypePresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-type.presenter.js'
import AlertTypeValidator from '../../../../validators/notices/setup/alert-type.validator.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload, session.licenceMonitoringStations)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.alertType = payload.alertType

  const pageData = AlertTypePresenter(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  if (session.alertType !== payload.alertType) {
    session.alertThresholds = []
    session.removedThresholds = []
  }

  session.alertType = payload.alertType

  return session.$update()
}

function _validate(payload, licenceMonitoringStations) {
  const validationResult = AlertTypeValidator(payload, licenceMonitoringStations)

  return formatValidationResult(validationResult)
}
