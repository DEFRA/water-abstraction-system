/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/check` page
 * @module CheckService
 */

import ApplyQuantitiesService from '../../../services/return-logs/setup/apply-quantities.service.js'
import CheckPresenter from '../../../presenters/return-logs/setup/check.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { readFlashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function check(sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  await _updateSession(session)

  const formattedData = CheckPresenter(session)

  const notification = readFlashNotification(yar)

  return {
    ...formattedData,
    notification
  }
}

async function _updateSession(session) {
  ApplyQuantitiesService(session)

  session.checkPageVisited = true

  return session.$update()
}
