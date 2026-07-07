/**
 * Controller for /users/internal/setup endpoints
 * @module UsersSetupController
 */

import InitiateExternalSessionService from '../services/users/external/setup/initiate-session.service.js'
import InitiateInternalEditSessionService from '../services/users/internal/setup/initiate-edit-session.service.js'
import InitiateInternalSessionService from '../services/users/internal/setup/initiate-session.service.js'
import SubmitExternalCancelService from '../services/users/external/setup/submit-cancel.service.js'
import SubmitExternalCheckService from '../services/users/external/setup/submit-check.service.js'
import SubmitExternalLicencesService from '../services/users/external/setup/submit-licences.service.js'
import SubmitInternalAccessService from '../services/users/internal/setup/submit-access.service.js'
import SubmitInternalCancelService from '../services/users/internal/setup/submit-cancel.service.js'
import SubmitInternalCheckService from '../services/users/internal/setup/submit-check.service.js'
import SubmitInternalEmailService from '../services/users/internal/setup/submit-email.service.js'
import SubmitInternalPermissionsService from '../services/users/internal/setup/submit-permissions.service.js'
import ViewExternalCancelService from '../services/users/external/setup/view-cancel.service.js'
import ViewExternalCheckService from '../services/users/external/setup/view-check.service.js'
import ViewExternalLicencesService from '../services/users/external/setup/view-licences.service.js'
import ViewInternalAccessService from '../services/users/internal/setup/view-access.service.js'
import ViewInternalCancelService from '../services/users/internal/setup/view-cancel.service.js'
import ViewInternalCheckService from '../services/users/internal/setup/view-check.service.js'
import ViewInternalEmailService from '../services/users/internal/setup/view-email.service.js'
import ViewInternalPermissionsService from '../services/users/internal/setup/view-permissions.service.js'

async function setupExternal(request, h) {
  const {
    params: { id },
    query: { back }
  } = request

  const { id: sessionId } = await InitiateExternalSessionService.go(id, back)

  return h.redirect(`/system/users/external/setup/${sessionId}/licences`)
}

async function setupInternal(_request, h) {
  const { id: sessionId } = await InitiateInternalSessionService.go()

  return h.redirect(`/system/users/internal/setup/${sessionId}/email`)
}

async function setupInternalEdit(request, h) {
  const {
    params: { id }
  } = request

  const { id: sessionId } = await InitiateInternalEditSessionService.go(id)

  return h.redirect(`/system/users/internal/setup/${sessionId}/check`)
}

async function submitExternalCancel(request, h) {
  const {
    params: { sessionId }
  } = request

  const { redirectUrl } = await SubmitExternalCancelService.go(sessionId)

  return h.redirect(redirectUrl)
}

async function submitExternalCheck(request, h) {
  const {
    auth,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitExternalCheckService.go(sessionId, yar, auth)

  if (pageData.error) {
    return h.view('users/external/setup/check.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitExternalLicences(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitExternalLicencesService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/external/setup/licences.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitInternalAccess(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitInternalAccessService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/access.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitInternalCancel(request, h) {
  const {
    params: { sessionId }
  } = request

  const { redirectUrl } = await SubmitInternalCancelService.go(sessionId)

  return h.redirect(redirectUrl)
}

async function submitInternalCheck(request, h) {
  const {
    auth,
    params: { sessionId },
    yar
  } = request

  const { redirectUrl } = await SubmitInternalCheckService.go(auth, sessionId, yar)

  return h.redirect(redirectUrl)
}

async function submitInternalEmail(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitInternalEmailService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/email.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitInternalPermissions(request, h) {
  const {
    auth,
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitInternalPermissionsService.go(auth, sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/permissions.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function viewExternalCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExternalCancelService.go(sessionId)

  return h.view('users/external/setup/cancel.njk', pageData)
}

async function viewExternalCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewExternalCheckService.go(sessionId, yar)

  return h.view('users/external/setup/check.njk', pageData)
}

async function viewExternalLicences(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExternalLicencesService.go(sessionId)

  return h.view('users/external/setup/licences.njk', pageData)
}

async function viewInternalAccess(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewInternalAccessService.go(sessionId)

  return h.view('users/internal/setup/access.njk', pageData)
}

async function viewInternalCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewInternalCancelService.go(sessionId)

  return h.view('users/internal/setup/cancel.njk', pageData)
}

async function viewInternalCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewInternalCheckService.go(sessionId, yar)

  return h.view('users/internal/setup/check.njk', pageData)
}

async function viewInternalEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewInternalEmailService.go(sessionId)

  return h.view('users/internal/setup/email.njk', pageData)
}

async function viewInternalPermissions(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewInternalPermissionsService.go(auth, sessionId)

  return h.view('users/internal/setup/permissions.njk', pageData)
}

export default {
  setupExternal,
  setupInternal,
  setupInternalEdit,
  submitExternalCancel,
  submitExternalCheck,
  submitExternalLicences,
  submitInternalAccess,
  submitInternalCancel,
  submitInternalCheck,
  submitInternalEmail,
  submitInternalPermissions,
  viewInternalAccess,
  viewExternalCancel,
  viewExternalCheck,
  viewExternalLicences,
  viewInternalCancel,
  viewInternalCheck,
  viewInternalEmail,
  viewInternalPermissions
}
