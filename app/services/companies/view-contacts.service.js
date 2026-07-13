/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/contacts' page
 *
 * @module ViewContactsService
 */

import ContactsPresenter from '../../presenters/companies/contacts.presenter.js'
import FetchCompanyCRMDataDal from '../../dal/companies/fetch-company-crm-data.dal.js'
import FetchCompanyDal from '../../dal/companies/fetch-company.dal.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { readFlashNotification } from '../../lib/general.lib.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/contacts' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewContactsService(companyId, auth, page, yar) {
  const company = await FetchCompanyDal(companyId)

  const roles = userRoles(auth)

  const { contacts, totalNumber } = await FetchCompanyCRMDataDal(companyId, roles, page)

  const pageData = ContactsPresenter(company, contacts)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/companies/${companyId}/contacts`,
    contacts.length,
    'contacts'
  )

  const notification = readFlashNotification(yar)

  return {
    ...pageData,
    activeSecondaryNav: 'contacts',
    pagination,
    roles,
    notification
  }
}
