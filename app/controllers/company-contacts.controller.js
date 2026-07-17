/**
 * Controller for /company-contacts endpoints
 * @module CompanyContactsController
 */

import SubmitRemoveCompanyContactService from '../services/company-contacts/submit-remove-company-contact.service.js'
import ViewCommunicationsService from '../services/company-contacts/view-communications.service.js'
import ViewContactDetailsService from '../services/company-contacts/view-contact-details.service.js'
import ViewRemoveCompanyContactService from '../services/company-contacts/view-remove-company-contact.service.js'

export async function viewCommunications(request, h) {
  const {
    params: { id },
    query: { page }
  } = request

  const pageData = await ViewCommunicationsService(id, page)

  return h.view(`company-contacts/communications.njk`, pageData)
}

export async function viewContactDetails(request, h) {
  const {
    params: { id },
    auth,
    yar
  } = request

  const pageData = await ViewContactDetailsService(id, auth, yar)

  return h.view(`company-contacts/contact-details.njk`, pageData)
}

export async function viewRemoveCompanyContact(request, h) {
  const { id } = request.params

  const pageData = await ViewRemoveCompanyContactService(id)

  return h.view(`company-contacts/remove-company-contact.njk`, pageData)
}

export async function submitRemoveCompanyContact(request, h) {
  const {
    params: { id },
    yar
  } = request

  const { companyId } = await SubmitRemoveCompanyContactService(id, yar)

  return h.redirect(`/system/companies/${companyId}/contacts`)
}
