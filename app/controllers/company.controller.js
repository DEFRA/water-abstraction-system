'use strict'

/**
 * Controller for /companies endpoints
 * @module CompanyController
 */

const ViewBillingAccountsService = require('../services/companies/view-billing-accounts.service.js')
const ViewContactsService = require('../services/companies/view-contacts.service.js')
const ViewLicencesService = require('../services/companies/view-licences.service.js')

async function viewBillingAccounts(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewBillingAccountsService.go(id, auth, page)

  return h.view(`companies/billing-accounts.njk`, pageData)
}

async function viewContact(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewContactsService.go(id, auth, page)

  return h.view(`companies/contact.njk`, pageData)
}

async function viewLicences(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewLicencesService.go(id, auth, page)

  return h.view(`companies/licences.njk`, pageData)
}

module.exports = {
  viewBillingAccounts,
  viewContact,
  viewLicences
}
