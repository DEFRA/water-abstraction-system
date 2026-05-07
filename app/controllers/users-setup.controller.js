'use strict'

/**
 * Controller for /users/internal/setup endpoints
 * @module UsersSetupController
 */

const InitiateSessionService = require('../services/users/internal/setup/initiate-session.service.js')
const SubmitUserEmailService = require('../services/users/internal/setup/submit-user-email.service.js')
const ViewPermissionsService = require('../services/users/internal/setup/view-permissions.service.js')
const ViewUserEmailService = require('../services/users/internal/setup/view-user-email.service.js')

async function setup(_request, h) {
  const { id: sessionId } = await InitiateSessionService.go()

  return h.redirect(`/system/users/internal/setup/${sessionId}/user-email`)
}

async function submitUserEmail(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitUserEmailService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('users/internal/setup/user-email.njk', pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function viewPermissions(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewPermissionsService.go(sessionId)

  return h.view('users/internal/setup/permissions.njk', pageData)
}

async function viewUserEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewUserEmailService.go(sessionId)

  return h.view('users/internal/setup/user-email.njk', pageData)
}

module.exports = {
  setup,
  submitUserEmail,
  viewPermissions,
  viewUserEmail
}
