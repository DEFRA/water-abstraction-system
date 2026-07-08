/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module ViewAlertTypeService
 */

import AlertTypePresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-type.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<{object}>} - The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AlertTypePresenter(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
