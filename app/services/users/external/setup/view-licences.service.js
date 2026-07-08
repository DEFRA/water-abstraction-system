/**
 * Orchestrates fetching and presenting the data for '/users/external/setup/{sessionId}/licences' page
 * @module ViewLicencesService
 */

import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import LicencesPresenter from '../../../../presenters/users/external/setup/licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for '/users/external/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = LicencesPresenter.go(session)

  return pageData
}

export {
  go
}
export default {
  go
}
