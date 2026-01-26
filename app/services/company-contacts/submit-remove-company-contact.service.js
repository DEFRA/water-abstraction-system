'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @module SubmitRemoveCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const { flashNotification } = require('../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data to redirect the user after the company contact has been removed
 */
async function go(id, yar) {
  const companyContact = await FetchCompanyContactService.go(id)

  await CompanyContactModel.query().deleteById(id)

  flashNotification(yar, 'Contact removed', `${companyContact.contact.$name()} was removed from this company.`)

  return {
    companyId: companyContact.companyId
  }
}

module.exports = {
  go
}
