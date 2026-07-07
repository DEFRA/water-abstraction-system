/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @module ViewLicencesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import LicencesPresenter from '../../../presenters/company-contacts/setup/licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = LicencesPresenter.go(session)

  return {
    ...pageData
  }
}

export default {
  go
}
