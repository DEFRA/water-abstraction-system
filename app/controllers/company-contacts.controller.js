'use strict'

/**
 * Controller for /company-contacts endpoints
 * @module CompanyContactsController
 */

const ViewCommunicationsService = require('../services/company-contacts/view-communications.service.js')
const ViewContactDetailsService = require('../services/company-contacts/view-contact-details.service.js')
const ViewRemoveCompanyContactService = require('../services/company-contacts/view-remove-company-contact.service.js')
const SubmitRemoveCompanyContactService = require('../services/company-contacts/submit-remove-company-contact.service.js')

async function viewCommunications(request, h) {
  const {
    params: { id },
    query: { page }
  } = request

  const pageData = await ViewCommunicationsService.go(id, page)

  return h.view(`company-contacts/communications.njk`, pageData)
}

async function viewContactDetails(request, h) {
  const {
    params: { id },
    auth,
    yar
  } = request

  const pageData = await ViewContactDetailsService.go(id, auth, yar)

  return h.view(`company-contacts/contact-details.njk`, pageData)
}

async function viewRemoveCompanyContact(request, h) {
  const { id } = request.params

  const pageData = await ViewRemoveCompanyContactService.go(id)

  return h.view(`company-contacts/remove-company-contact.njk`, pageData)
}

async function submitRemoveCompanyContact(request, h) {
  const {
    params: { id },
    yar
  } = request

  const { companyId } = await SubmitRemoveCompanyContactService.go(id, yar)

  return h.redirect(`/system/companies/${companyId}/contacts`)
}

module.exports = {
  viewCommunications,
  viewContactDetails,
  viewRemoveCompanyContact,
  submitRemoveCompanyContact
}
