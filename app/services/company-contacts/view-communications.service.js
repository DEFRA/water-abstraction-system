'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/communications' page
 *
 * @module ViewCommunicationsService
 */

const CommunicationsPresenter = require('../../presenters/company-contacts/communications.presenter.js')
const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const FetchNotificationsService = require('./fetch-notifications.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/communications' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, page) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const { notifications, totalNumber } = await FetchNotificationsService.go(companyContact.contact.email, page)

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

module.exports = {
  go
}
