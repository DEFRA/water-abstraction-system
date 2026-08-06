/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @module ViewCheckService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { markCheckPageVisited } from 'water-abstraction-engine/lib/check-page.lib.js'
import { readFlashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import CheckPresenter from '../../../../presenters/users/external/setup/check.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewCheckService(sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter(session)

  const notification = readFlashNotification(yar)

  return {
    ...pageData,
    notification
  }
}
