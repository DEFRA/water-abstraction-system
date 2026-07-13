/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @module SubmitAbstractionAlertsService
 */

import AbstractionAlertsPresenter from '../../../presenters/company-contacts/setup/abstraction-alerts.presenter.js'
import AbstractionAlertsValidator from '../../../validators/company-contacts/setup/abstraction-alerts.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: _redirectUrl(sessionId, payload)
    }
  }

  session.abstractionAlerts = payload.abstractionAlerts

  const pageData = AbstractionAlertsPresenter(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.abstractionAlerts !== payload.abstractionAlerts) {
    flashNotification(yar, 'Updated', 'Water abstraction alerts updated')
  }
}

function _redirectUrl(sessionId, payload) {
  if (payload.abstractionAlerts === 'some') {
    return `/system/company-contacts/setup/${sessionId}/licences`
  }

  return `/system/company-contacts/setup/${sessionId}/check`
}

async function _save(session, payload) {
  session.abstractionAlerts = payload.abstractionAlerts

  return session.$update()
}

function _validate(payload) {
  const validationResult = AbstractionAlertsValidator(payload)

  return formatValidationResult(validationResult)
}
