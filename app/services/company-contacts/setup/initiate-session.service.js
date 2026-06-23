'use strict'

/**
 * Initiates the session record used for setting up a new company contact
 * @module InitiateSessionService
 */

const CreateSessionDal = require('../../../dal/create-session.dal.js')
const FetchCompanyLicencesDal = require('../../../dal/company-contacts/fetch-company-licences.dal.js')
const FetchCompanyService = require('../../../dal/companies/fetch-company.dal.js')

/**
 * Initiates the session record used for setting up a new company contact
 *
 * @param {string} companyId - the UUID of the company
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(companyId) {
  const company = await FetchCompanyService.go(companyId)

  const licences = await FetchCompanyLicencesDal.go(companyId)

  const data = {
    company,
    licences
  }

  return CreateSessionDal.go(data)
}

module.exports = {
  go
}
