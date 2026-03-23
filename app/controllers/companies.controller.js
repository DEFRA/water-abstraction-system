'use strict'

/**
 * Controller for /companies endpoints
 * @module CompaniesController
 */

const ViewBillingAccountsService = require('../services/companies/view-billing-accounts.service.js')
const ViewCompanyService = require('../services/companies/view-company.service.js')
const ViewCompanyWithAddressService = require('../services/companies/view-company-with-address.service.js')
const ViewContactsService = require('../services/companies/view-contacts.service.js')
const ViewHistoryService = require('../services/companies/view-history.service.js')
const ViewLicencesService = require('../services/companies/view-licences.service.js')

async function viewBillingAccounts(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewBillingAccountsService.go(id, auth, page)

  return h.view(`companies/billing-accounts.njk`, pageData)
}

async function viewCompany(request, h) {
  const {
    params: { id, role }
  } = request
  const pageData = await ViewCompanyService.go(id, role)

  return h.view(`companies/company.njk`, pageData)
}

async function viewCompanyWithAddress(request, h) {
  const {
    params: { addressId, id, role },
    query: { 'licence-id': licenceId }
  } = request
  const pageData = await ViewCompanyWithAddressService.go(id, addressId, role, licenceId)

  return h.view(`companies/company-with-address.njk`, pageData)
}

async function viewContacts(request, h) {
  const {
    params: { id },
    auth,
    query: { page },
    yar
  } = request

  const pageData = await ViewContactsService.go(id, auth, page, yar)

  return h.view(`companies/contacts.njk`, pageData)
}

async function viewHistory(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewHistoryService.go(id, auth, page)

  return h.view(`companies/history.njk`, pageData)
}

async function viewLicences(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewLicencesService.go(id, auth, page)

  return h.view(`companies/licences.njk`, pageData)
}

module.exports = {
  viewBillingAccounts,
  viewCompany,
  viewCompanyWithAddress,
  viewContacts,
  viewHistory,
  viewLicences
}
