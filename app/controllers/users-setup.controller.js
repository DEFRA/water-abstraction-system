'use strict'

/**
 * Controller for /users/internal/setup endpoints
 * @module UsersSetupController
 */

const InitiateSessionService = require('../services/users/internal/setup/initiate-session.service.js')
const UserEmailService = require('../services/users/internal/setup/user-email.service.js')

async function userEmail(request, h) {
  const { sessionId } = request.params

  const pageData = await UserEmailService.go(sessionId)

  return h.view('users/internal/setup/user-email.njk', pageData)
}

async function setup(_request, h) {
  const { id: sessionId } = await InitiateSessionService.go()

  return h.redirect(`/system/users/internal/setup/${sessionId}/user-email`)
}

module.exports = {
  setup,
  userEmail
}
