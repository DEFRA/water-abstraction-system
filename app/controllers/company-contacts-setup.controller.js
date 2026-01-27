'use strict'

const ViewContactNameService = require('../services/company-contacts/setup/view-contact-name.service.js')
const InitiateSessionService = require('../services/company-contacts/setup/initiate-session.service.js')
const SubmitContactNameService = require('../services/company-contacts/setup/submit-contact-name.service.js')

/**
 * Controller for /company-contacts/setup endpoints
 * @module CompanyContactsSetupController
 */

async function setup(request, h) {
  const { companyId } = request.params

  const session = await InitiateSessionService.go(companyId)

  return h.redirect(`/system/company-contacts/setup/${session.id}/contact-name`)
}

async function viewContactName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactNameService.go(sessionId)

  return h.view(`company-contacts/setup/contact-name.njk`, pageData)
}

async function submitContactName(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactNameService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`company-contacts/setup/contact-name.njk`, pageData)
  }

  return h.redirect(`/system/company-contacts/setup/${sessionId}/contact-email`)
}

module.exports = {
  setup,
  viewContactName,
  submitContactName
}
