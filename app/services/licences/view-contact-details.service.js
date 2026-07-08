/**
 * Orchestrates fetching and presenting the data needed for the view contact details page
 * @module ViewContactDetailsService
 */

import ContactDetailsPresenter from '../../presenters/licences/contact-details.presenter.js'
import FetchLicenceCRMDataService from './fetch-licence-crm-data.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence contact details template.
 */
export default async function go(licenceId, auth, page) {
  const licence = await FetchLicenceService(licenceId)
  const roles = userRoles(auth)

  const { contacts, totalNumber } = await FetchLicenceCRMDataService(licenceId, roles, page)

  const pageData = ContactDetailsPresenter(contacts, licence)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/licences/${licenceId}/contact-details`,
    contacts.length,
    'contacts'
  )

  return {
    activeSecondaryNav: 'contact-details',
    ...pageData,
    pagination,
    roles
  }
}
