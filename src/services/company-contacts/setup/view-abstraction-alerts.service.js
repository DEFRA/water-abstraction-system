/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @module ViewAbstractionAlertsService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import AbstractionAlertsPresenter from '../../../presenters/company-contacts/setup/abstraction-alerts.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewAbstractionAlertsService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AbstractionAlertsPresenter(session)

  return {
    ...pageData
  }
}
