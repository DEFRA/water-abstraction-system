/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/communications' page
 *
 * @module ViewCommunicationsService
 */

import CommunicationsPresenter from '../../presenters/company-contacts/communications.presenter.js'
import FetchCompanyContactDal from '../../dal/company-contacts/fetch-company-contact.dal.js'
import FetchCompanyService from '../../dal/companies/fetch-company.dal.js'
import FetchNotificationsDal from '../../dal/company-contacts/fetch-notifications.dal.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/communications' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewCommunications(id, page) {
  const companyContact = await FetchCompanyContactDal(id)

  const company = await FetchCompanyService(companyContact.companyId)

  const { notifications, totalNumber } = await FetchNotificationsDal(companyContact.contact.email, page)

  const pageData = CommunicationsPresenter(company, companyContact, notifications)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/company-contacts/${companyContact.id}/communications`,
    notifications.length,
    'communications'
  )

  return {
    activeSecondaryNav: 'communications',
    pagination,
    ...pageData
  }
}
