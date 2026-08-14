/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module ViewCheckLicenceMatchesService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { readFlashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import CheckLicenceMatchesPresenter from '../../../../presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @param query
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewCheckLicenceMatchesService(sessionId, yar, query) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CheckLicenceMatchesPresenter(session, query)

  const notification = readFlashNotification(yar)

  return {
    activeNavBar: 'notices',
    ...pageData,
    notification
  }
}
