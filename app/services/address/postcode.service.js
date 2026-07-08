/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @module PostcodeService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
import PostcodePresenter from '../../presenters/address/postcode.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = PostcodePresenter.go(session)

  return {
    activeNavBar: session.addressJourney.activeNavBar,
    ...pageData
  }
}

export {
  go
}
export default {
  go
}
