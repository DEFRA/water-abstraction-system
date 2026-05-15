'use strict'

/**
 * Controller for /users/internal/setup endpoints
 * @module UsersSetupController
 */

const InitiateExternalSessionService = require('../services/users/external/setup/initiate-session.service.js')
const InitiateInternalSessionService = require('../services/users/internal/setup/initiate-session.service.js')
const SubmitCheckService = require('../services/users/internal/setup/submit-check.service.js')
const SubmitEmailService = require('../services/users/internal/setup/submit-email.service.js')
const SubmitExternalCancelService = require('../services/users/external/setup/submit-cancel.service.js')
const SubmitExternalCheckService = require('../services/users/external/setup/submit-check.service.js')
const SubmitExternalLicencesService = require('../services/users/external/setup/submit-licences.service.js')
const SubmitPermissionsService = require('../services/users/internal/setup/submit-permissions.service.js')
const ViewCheckService = require('../services/users/internal/setup/view-check.service.js')
const ViewEmailService = require('../services/users/internal/setup/view-email.service.js')
const ViewExternalCancelService = require('../services/users/external/setup/view-cancel.service.js')
const ViewExternalCheckService = require('../services/users/external/setup/view-check.service.js')
const ViewExternalLicencesService = require('../services/users/external/setup/view-licences.service.js')
const ViewPermissionsService = require('../services/users/internal/setup/view-permissions.service.js')

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

async function submitCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  await SubmitCheckService.go(sessionId, yar)

  return h.redirect('/system/users')
}

async function submitEmail(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitEmailService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/email.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
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

async function submitPermissions(request, h) {
  const {
    auth,
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitPermissionsService.go(auth, sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/permissions.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function viewCheck(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckService.go(sessionId, yar)

  return h.view('users/internal/setup/check.njk', pageData)
}

async function viewEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewEmailService.go(sessionId)

  return h.view('users/internal/setup/email.njk', pageData)
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

async function viewPermissions(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewPermissionsService.go(auth, sessionId)

  return h.view('users/internal/setup/permissions.njk', pageData)
}

module.exports = {
  setupExternal,
  setupInternal,
  submitCheck,
  submitEmail,
  submitExternalCancel,
  submitExternalCheck,
  submitExternalLicences,
  submitPermissions,
  viewCheck,
  viewEmail,
  viewExternalCancel,
  viewExternalCheck,
  viewExternalLicences,
  viewPermissions
}
