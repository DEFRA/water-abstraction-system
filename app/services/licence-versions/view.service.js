/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @module ViewService
 */

import FetchConditionsService from '../licences/fetch-conditions.service.js'
import FetchLicenceVersionDal from '../../dal/licence-versions/fetch-licence-version.dal.js'
import ViewPresenter from '../../presenters/licence-versions/view.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID of the licence version
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function view(licenceVersionId, auth) {
  const licenceVersionData = await FetchLicenceVersionDal(licenceVersionId)
  const conditions = await FetchConditionsService(licenceVersionId)

  const pageData = ViewPresenter(licenceVersionData, auth, conditions)

  return {
    ...pageData
  }
}
