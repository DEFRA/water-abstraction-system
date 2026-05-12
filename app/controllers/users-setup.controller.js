'use strict'

/**
 * Controller for /users/internal/setup endpoints
 * @module UsersSetupController
 */

const InitiateSessionService = require('../services/users/internal/setup/initiate-session.service.js')
const SubmitEmailService = require('../services/users/internal/setup/submit-email.service.js')
const SubmitPermissionsService = require('../services/users/internal/setup/submit-permissions.service.js')
const ViewEmailService = require('../services/users/internal/setup/view-email.service.js')
const ViewPermissionsService = require('../services/users/internal/setup/view-permissions.service.js')

async function setup(_request, h) {
  const { id: sessionId } = await InitiateSessionService.go()

  return h.redirect(`/system/users/internal/setup/${sessionId}/email`)
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

async function viewEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewEmailService.go(sessionId)

  return h.view('users/internal/setup/email.njk', pageData)
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
  setup,
  submitEmail,
  submitPermissions,
  viewEmail,
  viewPermissions
}
