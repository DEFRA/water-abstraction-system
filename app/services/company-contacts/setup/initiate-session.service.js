'use strict'

/**
 * Initiates the session record used for setting up a new company contact
 * @module InitiateSessionService
 */

const SessionModel = require('../../../models/session.model.js')
const FetchCompanyService = require('../../companies/fetch-company.service.js')

/**
 * Initiates the session record used for setting up a new company contact
 *
 * @param {string} companyId - the UUID of the company
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(companyId) {
  const company = await FetchCompanyService.go(companyId)

  return SessionModel.query()
    .insert({
      data: {
        company
      }
    })
    .returning('id')
}

module.exports = {
  go
}
