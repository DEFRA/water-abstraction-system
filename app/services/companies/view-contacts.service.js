'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/contacts' page
 *
 * @module ViewContactsService
 */

const ContactsPresenter = require('../../presenters/companies/contacts.presenter.js')
const FetchCompanyCRMDataService = require('./fetch-company-crm-data.service.js')
const FetchCompanyService = require('./fetch-company.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { readFlashNotification } = require('../../lib/general.lib.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

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
async function go(companyId, auth, page, yar) {
  const company = await FetchCompanyService.go(companyId)

  const roles = userRoles(auth)

  const { contacts, totalNumber } = await FetchCompanyCRMDataService.go(companyId, roles, page)

  const pageData = ContactsPresenter.go(company, contacts)

  const pagination = PaginatorPresenter.go(
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

module.exports = {
  go
}
