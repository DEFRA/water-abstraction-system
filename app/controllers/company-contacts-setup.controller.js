'use strict'

const InitiateSessionService = require('../services/company-contacts/setup/initiate-session.service.js')
const SubmitContactEmailService = require('../services/company-contacts/setup/submit-contact-email.service.js')
const SubmitContactNameService = require('../services/company-contacts/setup/submit-contact-name.service.js')
const ViewContactEmailService = require('../services/company-contacts/setup/view-contact-email.service.js')
const ViewContactNameService = require('../services/company-contacts/setup/view-contact-name.service.js')

/**
 * Controller for /company-contacts/setup endpoints
 * @module CompanyContactsSetupController
 */

async function setup(request, h) {
  const { companyId } = request.params

  const session = await InitiateSessionService.go(companyId)

  return h.redirect(`/system/company-contacts/setup/${session.id}/contact-name`)
}

async function viewContactEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactEmailService.go(sessionId)

  return h.view(`company-contacts/setup/contact-email.njk`, pageData)
}

async function viewContactName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactNameService.go(sessionId)

  return h.view(`company-contacts/setup/contact-name.njk`, pageData)
}

async function submitContactEmail(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactEmailService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`company-contacts/setup/contact-email.njk`, pageData)
  }

  return h.redirect('')
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
  viewContactEmail,
  viewContactName,
  submitContactEmail,
  submitContactName
}
