/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 * @module ViewRemoveLicencesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RemoveLicencesPresenter from '../../../presenters/notices/setup/remove-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 *
 * @returns {Promise<object>} The view data for the remove licences page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const { removeLicences = [] } = session

  const formattedData = RemoveLicencesPresenter.go(removeLicences, session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

export { go }
export default {
  go
}
