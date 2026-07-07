/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @module ViewCheckNoticeTypeService
 */

import CheckNoticeTypePresenter from '../../../presenters/notices/setup/check-notice-type.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { readFlashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @param {string} sessionId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  await _markCheckPageVisited(session)

  const pageData = CheckNoticeTypePresenter.go(session)

  const notification = readFlashNotification(yar)

  return {
    ...pageData,
    activeNavBar: 'notices',
    notification
  }
}

async function _markCheckPageVisited(session) {
  session.checkPageVisited = true

  return session.$update()
}

export default {
  go
}
