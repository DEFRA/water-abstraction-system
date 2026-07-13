/**
 * Initiates the session record used for setting up a new company contact
 * @module InitiateSessionService
 */

import CreateSessionDal from '../../../dal/create-session.dal.js'
import FetchCompanyLicencesDal from '../../../dal/company-contacts/fetch-company-licences.dal.js'
import FetchCompanyService from '../../../dal/companies/fetch-company.dal.js'

/**
 * Initiates the session record used for setting up a new company contact
 *
 * @param {string} companyId - the UUID of the company
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
export default async function initiateSession(companyId) {
  const company = await FetchCompanyService(companyId)

  const licences = await FetchCompanyLicencesDal(companyId)

  const data = {
    company,
    licences
  }

  return CreateSessionDal(data)
}
