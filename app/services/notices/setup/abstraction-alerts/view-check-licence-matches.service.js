/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module ViewCheckLicenceMatchesService
 */

import CheckLicenceMatchesPresenter from '../../../../presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { readFlashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CheckLicenceMatchesPresenter(session)

  const notification = readFlashNotification(yar)

  return {
    activeNavBar: 'notices',
    ...pageData,
    notification
  }
}
