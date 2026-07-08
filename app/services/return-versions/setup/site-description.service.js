/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/site-description` page
 * @module SiteDescriptionService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SiteDescriptionPresenter from '../../../presenters/return-versions/setup/site-description.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/site-description` page
 *
 * Supports generating the data needed for the site description page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the site description page
 */
export default async function go(sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = SiteDescriptionPresenter.go(session, requirementIndex)

  return {
    ...formattedData
  }
}
