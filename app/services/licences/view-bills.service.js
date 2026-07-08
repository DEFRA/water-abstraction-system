/**
 * Orchestrates fetching and presenting the data needed for the view licence bills tab
 * @module ViewBillsService
 */

import BillsPresenter from '../../presenters/licences/bills.presenter.js'
import FetchBillsService from './fetch-bills.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the view licence bills tab
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence bills template.
 */
export default async function go(licenceId, auth, page) {
  const licence = await FetchLicenceService(licenceId)

  const { bills, totalNumber } = await FetchBillsService(licenceId, page)

  const pageData = BillsPresenter(bills, licence)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/licences/${licenceId}/bills`,
    bills.length,
    'bills'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'bills',
    pagination,
    roles: userRoles(auth)
  }
}
