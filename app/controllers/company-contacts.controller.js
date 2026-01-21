'use strict'

/**
 * Controller for /company-contacts endpoints
 * @module CompanyContactsController
 */

const ViewCompanyContactService = require('../services/company-contacts/view-company-contact.service.js')

async function viewCompanyContact(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewCompanyContactService.go(id, auth)

  return h.view(`company-contacts/view-company-contact.njk`, pageData)
}

module.exports = {
  viewCompanyContact
}
