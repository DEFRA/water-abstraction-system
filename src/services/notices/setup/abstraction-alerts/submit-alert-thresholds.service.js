/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module SubmitAlertThresholdsService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'
import { handleOneOptionSelected } from 'water-abstraction-engine/lib/submit-page.lib.js'

import AlertThresholdsPresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js'
import AlertThresholdsValidator from '../../../../validators/notices/setup/alert-thresholds.validator.js'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function submitAlertThresholdsService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'alertThresholds')

  _clearFilterIfRequired(session, payload, yar)

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

/**
 * Clear the licence match filter when the user changes their previously selected alert thresholds
 *
 * The filter is on abstraction periods, and those periods are derived from the licence monitoring stations that match
 * the selected thresholds. Change the thresholds and the periods change with them, which would leave the saved filter
 * pointing at options no longer available on the page.
 *
 * The `session.alertThresholds` array will always have a length of zero upon the first visit to the "Which thresholds
 * do you need to send an alert for?" page. In this case a filter will not have been set yet.
 *
 * We also leave the filter alone when nothing has been selected. Validation will fail, so the user's previously
 * selected thresholds are never changed.
 *
 * @private
 */
function _clearFilterIfRequired(session, payload, yar) {
  const { alertThresholds } = session

  if (alertThresholds.length === 0 || payload.alertThresholds.length === 0) {
    return
  }

  const matchingCount = alertThresholds.length === payload.alertThresholds.length
  const matchingContent = alertThresholds.every((alertThreshold) => {
    return payload.alertThresholds.includes(alertThreshold)
  })

  if (matchingCount && matchingContent) {
    return
  }

  yar.clear(`checkLicenceMatchesFilter-${session.id}`)
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = AlertThresholdsValidator(payload)

  return formatValidationResult(validationResult)
}
