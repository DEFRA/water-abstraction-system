/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/purpose` page
 * @module PurposeService
 */

import FetchPurposesService from './fetch-purposes.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SelectPurposePresenter from '../../../presenters/return-versions/setup/purpose.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/purpose` page
 *
 * Supports generating the data needed for the purpose page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the purpose page
 */
export default async function go(sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)
  const purposesData = await FetchPurposesService(session.licenceVersion.id)

  const formattedData = SelectPurposePresenter(session, requirementIndex, purposesData)

  return {
    ...formattedData
  }
}
