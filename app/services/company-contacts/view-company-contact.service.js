'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @module ViewCompanyContactService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const ViewCompanyContactPresenter = require('../../presenters/company-contacts/view-company-contact.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')
const { readFlashNotification } = require('../../lib/general.lib.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth, yar) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const pageData = ViewCompanyContactPresenter.go(company, companyContact)

  const notification = readFlashNotification(yar)

  return {
    ...pageData,
    roles: userRoles(auth),
    notification
  }
}

module.exports = {
  go
}
