'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @module ViewCompanyContactService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const FetchNotificationsService = require('./fetch-notifications.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewCompanyContactPresenter = require('../../presenters/company-contacts/view-company-contact.presenter.js')
const { readFlashNotification } = require('../../lib/general.lib.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth, yar, page) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const { notifications, totalNumber } = await FetchNotificationsService.go(companyContact.contact.email, page)

  const pageData = ViewCompanyContactPresenter.go(company, companyContact, notifications)

  const notification = readFlashNotification(yar)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/company-contacts/${companyContact.id}`,
    notifications.length,
    'communications'
  )

  return {
    ...pageData,
    roles: userRoles(auth),
    notification,
    pagination
  }
}

module.exports = {
  go
}
