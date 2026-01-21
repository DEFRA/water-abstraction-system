'use strict'

/**
 * Controller for /company-contacts endpoints
 * @module CompanyContactsController
 */

const ViewCompanyContactService = require('../services/company-contacts/view-company-contact.service.js')
const ViewRemoveCompanyContactService = require('../services/company-contacts/view-remove-company-contact.service.js')
const SubmitRemoveCompanyContactService = require('../services/company-contacts/submit-remove-company-contact.service.js')

async function viewCompanyContact(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewCompanyContactService.go(id, auth)

  return h.view(`company-contacts/view-company-contact.njk`, pageData)
}

async function viewRemoveCompanyContact(request, h) {
  const { id } = request.params

  const pageData = await ViewRemoveCompanyContactService.go(id)

  return h.view(`company-contacts/remove-company-contact.njk`, pageData)
}

async function submitRemoveCompanyContact(request, h) {
  const { id } = request.params

  const { companyId } = await SubmitRemoveCompanyContactService.go(id)

  return h.redirect(`/system/companies/${companyId}/contacts`)
}

module.exports = {
  viewCompanyContact,
  viewRemoveCompanyContact,
  submitRemoveCompanyContact
}
