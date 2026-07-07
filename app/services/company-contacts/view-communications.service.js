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
async function go(id, page) {
  const companyContact = await FetchCompanyContactDal.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const { notifications, totalNumber } = await FetchNotificationsDal.go(companyContact.contact.email, page)

  const pageData = CommunicationsPresenter.go(company, companyContact, notifications)

  const pagination = PaginatorPresenter.go(
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

export default {
  go
}
