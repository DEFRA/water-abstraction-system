/**
 * Orchestrates fetching and presenting the data needed for the licence returns page
 * @module ViewReturnsService
 */

import DetermineLicenceHasReturnVersionsService from './determine-licence-has-return-versions.service.js'
import FetchReturnsService from './fetch-returns.service.js'
import FetchLicenceService from '../../services/licences/fetch-licence.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import ReturnsPresenter from '../../presenters/licences/returns.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
export default async function go(licenceId, auth, page) {
  const licence = await FetchLicenceService(licenceId)

  const hasRequirements = await DetermineLicenceHasReturnVersionsService(licenceId)

  const { returns, totalNumber } = await FetchReturnsService(licenceId, page)

  const pageData = ReturnsPresenter(returns, hasRequirements, licence)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/licences/${licenceId}/returns`,
    returns.length,
    'returns'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'returns',
    pagination,
    roles: userRoles(auth)
  }
}
