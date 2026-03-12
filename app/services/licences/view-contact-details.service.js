'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view contact details page
 * @module ViewContactDetailsService
 */

const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')
const ContactDetailsPresenter = require('../../presenters/licences/contact-details.presenter.js')
const FetchContactDetailsService = require('./fetch-contact-details.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence contact details template.
 */
async function go(licenceId, auth, page) {
  const licence = await FetchLicenceService.go(licenceId)
  const roles = userRoles(auth)

  const { contacts, totalNumber } = await FetchContactDetailsService.go(licenceId, roles, page)

  const pageData = ContactDetailsPresenter.go(contacts, licence)

  const pagination = PaginatorPresenter.go(
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

module.exports = {
  go
}
