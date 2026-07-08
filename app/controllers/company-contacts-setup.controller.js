import InitiateEditSessionService from '../services/company-contacts/setup/initiate-edit-session.service.js'
import InitiateSessionService from '../services/company-contacts/setup/initiate-session.service.js'
import SubmitAbstractionAlertsService from '../services/company-contacts/setup/submit-abstraction-alerts.service.js'
import SubmitCancelService from '../services/company-contacts/setup/submit-cancel.service.js'
import SubmitCheckService from '../services/company-contacts/setup/submit-check.service.js'
import SubmitContactEmailService from '../services/company-contacts/setup/submit-contact-email.service.js'
import SubmitContactNameService from '../services/company-contacts/setup/submit-contact-name.service.js'
import SubmitLicencesService from '../services/company-contacts/setup/submit-licences.service.js'
import SubmitRestoreService from '../services/company-contacts/setup/submit-restore.service.js'
import ViewAbstractionAlertsService from '../services/company-contacts/setup/view-abstraction-alerts.service.js'
import ViewCancelService from '../services/company-contacts/setup/view-cancel.service.js'
import ViewCheckService from '../services/company-contacts/setup/view-check.service.js'
import ViewContactEmailService from '../services/company-contacts/setup/view-contact-email.service.js'
import ViewContactNameService from '../services/company-contacts/setup/view-contact-name.service.js'
import ViewLicencesService from '../services/company-contacts/setup/view-licences.service.js'
import ViewRestoreService from '../services/company-contacts/setup/view-restore.service.js'

/**
 * Controller for /company-contacts/setup endpoints
 * @module CompanyContactsSetupController
 */

export async function setup(request, h) {
  const { companyId } = request.params

  const session = await InitiateSessionService.go(companyId)

  return h.redirect(`/system/company-contacts/setup/${session.id}/contact-name`)
}

export async function setupEdit(request, h) {
  const { companyContactId } = request.params

  const session = await InitiateEditSessionService.go(companyContactId)

  return h.redirect(`/system/company-contacts/setup/${session.id}/check`)
}

export async function viewAbstractionAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAbstractionAlertsService.go(sessionId)

  return h.view(`company-contacts/setup/abstraction-alerts.njk`, pageData)
}

export async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelService.go(sessionId)

  return h.view(`company-contacts/setup/cancel.njk`, pageData)
}

export async function viewCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckService.go(sessionId, yar)

  return h.view(`company-contacts/setup/check.njk`, pageData)
}

export async function viewContactEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactEmailService.go(sessionId)

  return h.view(`company-contacts/setup/contact-email.njk`, pageData)
}

export async function viewContactName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactNameService.go(sessionId)

  return h.view(`company-contacts/setup/contact-name.njk`, pageData)
}

export async function viewLicences(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewLicencesService.go(sessionId)

  return h.view(`company-contacts/setup/licences.njk`, pageData)
}

export async function viewRestore(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewRestoreService.go(sessionId)

  return h.view(`company-contacts/setup/restore.njk`, pageData)
}

export async function submitAbstractionAlerts(request, h) {
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

export async function submitCancel(request, h) {
  const {
    params: { sessionId }
  } = request

  const { redirectUrl } = await SubmitCancelService.go(sessionId)

  return h.redirect(redirectUrl)
}

export async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId },
    yar
  } = request

  const { redirectUrl } = await SubmitCheckService.go(sessionId, yar, auth)

  return h.redirect(redirectUrl)
}

export async function submitContactEmail(request, h) {
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

export async function submitContactName(request, h) {
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

export async function submitLicences(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitLicencesService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`company-contacts/setup/licences.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitRestore(request, h) {
  const {
    auth,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitRestoreService.go(sessionId, yar, auth)

  return h.redirect(pageData.redirectUrl)
}
