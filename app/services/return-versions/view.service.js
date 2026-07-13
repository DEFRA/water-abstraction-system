/**
 * Orchestrates fetching and presenting the data for `/return-versions/{sessionId}/view` page
 * @module ViewService
 */

import FetchReturnVersionService from './fetch-return-version.service.js'
import ViewPresenter from '../../presenters/return-versions/view.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/{sessionId}/view` page
 *
 * @param {string} returnVersionId - The UUID for the return version
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function view(returnVersionId) {
  const returnVersionData = await FetchReturnVersionService(returnVersionId)

  const formattedData = ViewPresenter(returnVersionData)

  return {
    ...formattedData
  }
}
