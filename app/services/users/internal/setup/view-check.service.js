/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @module ViewCheckService
 */

import CheckPresenter from '../../../../presenters/users/internal/setup/check.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { markCheckPageVisited } from '../../../../lib/check-page.lib.js'
import { readFlashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter(session)

  const notification = readFlashNotification(yar)

  return {
    notification,
    ...pageData
  }
}
