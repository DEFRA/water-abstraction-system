'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/contact-details' page
 *
 * @module ViewContactDetailsService
 */

const ContactDetailsPresenter = require('../../presenters/company-contacts/contact-details.presenter.js')
const FetchCompanyContactDetailsService = require('./fetch-company-contact-details.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const { readFlashNotification } = require('../../lib/general.lib.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/contact-details' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth, yar) {
  const companyContact = await FetchCompanyContactDetailsService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const pageData = ContactDetailsPresenter.go(company, companyContact)

  const notification = readFlashNotification(yar)

  return {
    activeSecondaryNav: 'contact-details',
    notification,
    roles: userRoles(auth),
    ...pageData
  }
}

module.exports = {
  go
}
