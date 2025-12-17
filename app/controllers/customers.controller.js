'use strict'

/**
 * Controller for /customers endpoints
 * @module CustomersController
 */

const BillingAccountsService = require('../services/customers/billing-accounts.service.js')
const ContactService = require('../services/customers/contacts.service.js')
const LicencesService = require('../services/customers/licences.service.js')

async function viewBillingAccounts(request, h) {
  const { sessionId } = request.params

  const pageData = await BillingAccountsService.go(sessionId)

  return h.view(`customers/billing-accounts.njk`, pageData)
}

async function viewContact(request, h) {
  const { id } = request.params

  const pageData = await ContactService.go(id)

  return h.view(`customers/contact.njk`, pageData)
}

async function viewLicences(request, h) {
  const { id } = request.params

  const pageData = await LicencesService.go(id)

  return h.view(`customers/licences.njk`, pageData)
}

module.exports = {
  viewBillingAccounts,
  viewContact,
  viewLicences
}
