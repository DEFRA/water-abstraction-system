/**
 * Controller for /companies endpoints
 * @module CompaniesController
 */

import ViewBillingAccountsService from '../services/companies/view-billing-accounts.service.js'
import ViewCompanyService from '../services/companies/view-company.service.js'
import ViewCompanyWithAddressService from '../services/companies/view-company-with-address.service.js'
import ViewContactsService from '../services/companies/view-contacts.service.js'
import ViewHistoryService from '../services/companies/view-history.service.js'
import ViewLicencesService from '../services/companies/view-licences.service.js'

export async function viewBillingAccounts(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewBillingAccountsService(id, auth, page)

  return h.view(`companies/billing-accounts.njk`, pageData)
}

export async function viewCompany(request, h) {
  const {
    params: { id, role }
  } = request
  const pageData = await ViewCompanyService(id, role)

  return h.view(`companies/company.njk`, pageData)
}

export async function viewCompanyWithAddress(request, h) {
  const {
    params: { addressId, id, role },
    query: { 'licence-id': licenceId }
  } = request
  const pageData = await ViewCompanyWithAddressService(id, addressId, role, licenceId)

  return h.view(`companies/company-with-address.njk`, pageData)
}

export async function viewContacts(request, h) {
  const {
    params: { id },
    auth,
    query: { page },
    yar
  } = request

  const pageData = await ViewContactsService(id, auth, page, yar)

  return h.view(`companies/contacts.njk`, pageData)
}

export async function viewHistory(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewHistoryService(id, auth, page)

  return h.view(`companies/history.njk`, pageData)
}

export async function viewLicences(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewLicencesService(id, auth, page)

  return h.view(`companies/licences.njk`, pageData)
}
