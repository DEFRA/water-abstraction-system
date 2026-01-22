'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @module SubmitRemoveCompanyContactService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')

/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 *
 * @returns {Promise<object>} The data to redirect the user after the company contact has been removed
 */
async function go(id) {
  const companyContact = await FetchCompanyContactService.go(id)

  return {
    companyId: companyContact.companyId
  }
}

module.exports = {
  go
}
