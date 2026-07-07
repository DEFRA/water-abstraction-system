/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @module ViewContactTypeService
 */

import ContactTypePresenter from '../../../presenters/notices/setup/contact-type.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = ContactTypePresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

export { go }
export default {
  go
}
