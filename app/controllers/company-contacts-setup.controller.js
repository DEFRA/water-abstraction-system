'use strict'

const InitiateSessionService = require('../services/company-contacts/setup/initiate-session.service.js')

/**
 * Controller for /company-contacts/setup endpoints
 * @module CompanyContactsSetupController
 */

async function setup(request, h) {
  const { companyId } = request.params

  const session = await InitiateSessionService.go(companyId)

  return h.redirect(`/system/company-contacts/setup/${session.id}/name`)
}

module.exports = {
  setup
}
