/**
 * Orchestrates fetching and presenting the data needed for the licence returns page
 * @module ViewReturnsService
 */

import PaginatorPresenter from 'water-abstraction-engine/presenters/paginator.presenter.js'

import DetermineLicenceHasReturnVersionsService from './determine-licence-has-return-versions.service.js'
import FetchLicenceDal from '../../dal/licences/fetch-licence.dal.js'
import FetchReturnsDal from '../../dal/licences/fetch-returns.dal.js'
import ReturnsPresenter from '../../presenters/licences/returns.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence returns page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence returns template.
 */
export default async function viewReturnsService(licenceId, auth, page) {
  const licence = await FetchLicenceDal(licenceId)

  const hasRequirements = await DetermineLicenceHasReturnVersionsService(licenceId)

  const { returns, totalNumber } = await FetchReturnsDal(licenceId, page)

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
