/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module ViewNoticeTypeService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NoticeTypePresenter from '../../../presenters/notices/setup/notice-type.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {string} sessionId
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, auth) {
  const session = await FetchSessionDal(sessionId)

  const pageData = NoticeTypePresenter(session, auth)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
