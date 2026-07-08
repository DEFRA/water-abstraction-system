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
async function go(id) {
  const companyContact = await FetchCompanyContactDal(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const licences = await FetchAbstractionAlertLicencesDal(companyContact.abstractionAlertLicences)

  const pageData = RemoveCompanyContactPresenter.go(company, companyContact, licences)

  return {
    ...pageData
  }
}

export {
  go
}
export default {
  go
}
