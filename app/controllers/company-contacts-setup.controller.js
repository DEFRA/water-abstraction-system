'use strict'

const InitiateSessionService = require('../services/company-contacts/setup/initiate-session.service.js')
const SubmitAbstractionAlertsService = require('../services/company-contacts/setup/submit-abstraction-alerts.service.js')
const SubmitCancelService = require('../services/company-contacts/setup/submit-cancel.service.js')
const SubmitCheckService = require('../services/company-contacts/setup/submit-check.service.js')
const SubmitContactEmailService = require('../services/company-contacts/setup/submit-contact-email.service.js')
const SubmitContactNameService = require('../services/company-contacts/setup/submit-contact-name.service.js')
const ViewAbstractionAlertsService = require('../services/company-contacts/setup/view-abstraction-alerts.service.js')
const ViewCancelService = require('../services/company-contacts/setup/view-cancel.service.js')
const ViewCheckService = require('../services/company-contacts/setup/view-check.service.js')
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

async function viewAbstractionAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAbstractionAlertsService.go(sessionId)

  return h.view(`company-contacts/setup/abstraction-alerts.njk`, pageData)
}

async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelService.go(sessionId)

  return h.view(`company-contacts/setup/cancel.njk`, pageData)
}

async function viewCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckService.go(sessionId, yar)

  return h.view(`company-contacts/setup/check.njk`, pageData)
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

async function submitAbstractionAlerts(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitAbstractionAlertsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`company-contacts/setup/abstraction-alerts.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitCancel(request, h) {
  const {
    params: { sessionId }
  } = request

  const { redirectUrl } = await SubmitCancelService.go(sessionId)

  return h.redirect(redirectUrl)
}

async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId },
    yar
  } = request

  const { redirectUrl } = await SubmitCheckService.go(sessionId, yar, auth)

  return h.redirect(redirectUrl)
}

async function submitContactEmail(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitContactEmailService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`company-contacts/setup/contact-email.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitContactName(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitContactNameService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`company-contacts/setup/contact-name.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

module.exports = {
  setup,
  viewAbstractionAlerts,
  viewCancel,
  viewCheck,
  viewContactEmail,
  viewContactName,
  submitAbstractionAlerts,
  submitCancel,
  submitCheck,
  submitContactEmail,
  submitContactName
}
