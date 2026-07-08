/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @module ViewCancelAlertsService
 */

import CancelAlertsPresenter from '../../../../presenters/notices/setup/abstraction-alerts/cancel-alerts.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CancelAlertsPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

export { go }
export default {
  go
}
