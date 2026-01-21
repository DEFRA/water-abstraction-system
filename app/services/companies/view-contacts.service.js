'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/contacts' page
 *
 * @module ViewContactsService
 */

const ContactsPresenter = require('../../presenters/companies/contacts.presenter.js')
const FetchCompanyService = require('./fetch-company.service.js')
const FetchContactsService = require('./fetch-company-contacts.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/contacts' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, auth, page) {
  const company = await FetchCompanyService.go(companyId)

  const { companyContacts, pagination } = await FetchContactsService.go(companyId, page)

  const pageData = ContactsPresenter.go(company, companyContacts)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/companies/${companyId}/contacts`,
    companyContacts.length,
    'contacts'
  )

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'contacts',
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
