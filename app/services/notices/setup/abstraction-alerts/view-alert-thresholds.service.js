/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module ViewAlertThresholdsService
 */

import AlertThresholdsPresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AlertThresholdsPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
