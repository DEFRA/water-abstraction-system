/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/address/{addressId}/{role}' page
 *
 * @module ViewCompanyWithAddressService
 */

import CompanyWithAddressPresenter from '../../presenters/companies/company-with-address.presenter.js'
import FetchAddressDal from '../../dal/companies/fetch-address.dal.js'
import FetchCompanyDal from '../../dal/companies/fetch-company.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/address/{addressId}/{role}' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {string} addressId - the UUID of the address
 * @param {string} role - the licence role in kebab case e.g 'licence-holder'
 * @param {string} [licenceId=null] - the UUID of the licence the user was viewing
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, addressId, role, licenceId = null) {
  const company = await FetchCompanyDal.go(companyId)
  const address = await FetchAddressDal.go(addressId)

  const pageData = CompanyWithAddressPresenter.go(company, address, role, licenceId)

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
