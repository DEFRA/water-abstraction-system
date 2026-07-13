/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @module ViewRemoveCompanyContactService
 */

import FetchAbstractionAlertLicencesDal from '../../dal/company-contacts/fetch-abstraction-alert-licences.dal.js'
import FetchCompanyContactDal from '../../dal/company-contacts/fetch-company-contact.dal.js'
import FetchCompanyService from '../../dal/companies/fetch-company.dal.js'
import RemoveCompanyContactPresenter from '../../presenters/company-contacts/remove-company-contact.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (id) {
  const companyContact = await FetchCompanyContactDal(id)

  const company = await FetchCompanyService(companyContact.companyId)

  const licences = await FetchAbstractionAlertLicencesDal(companyContact.abstractionAlertLicences)

  const pageData = RemoveCompanyContactPresenter(company, companyContact, licences)

  return {
    ...pageData
  }
}
