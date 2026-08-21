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
 * The filter is only relevant to the thresholds it was applied against, so once they change we drop it to avoid
 * filtering the licence matches by a threshold that is no longer selected.
 *
 * The `session.alertThresholds` array will always have a length of zero upon the first visit to the "Which thresholds
 * do you need to send an alert for?" page. In this case a filter will not have been set yet.
 *
 * @private
 */
function _clearFilterIfRequired(session, payload, yar) {
  if (session.alertThresholds.length > 0 && session.alertThresholds !== payload.alertThresholds) {
    yar.clear(`checkLicenceMatchesFilter-${session.id}`)
  }
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = AlertThresholdsValidator(payload)

  return formatValidationResult(validationResult)
}
