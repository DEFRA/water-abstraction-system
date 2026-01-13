'use strict'

/**
 * Controller for /customers endpoints
 * @module CustomersController
 */

const ViewBillingAccountsService = require('../services/customers/view-billing-accounts.service.js')
const ViewContactsService = require('../services/customers/view-contacts.service.js')
const ViewLicencesService = require('../services/customers/view-licences.service.js')

async function viewBillingAccounts(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewBillingAccountsService.go(id, auth, page)

  return h.view(`customers/billing-accounts.njk`, pageData)
}

async function viewContact(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewContactsService.go(id, auth, page)

  return h.view(`customers/contact.njk`, pageData)
}

async function viewLicences(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewLicencesService.go(id, auth, page)

  return h.view(`customers/licences.njk`, pageData)
}

module.exports = {
  viewBillingAccounts,
  viewContact,
  viewLicences
}
