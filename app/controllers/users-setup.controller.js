'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const InitiateSessionService = require('../services/users/internal/setup/initiate-session.service.js')

async function setup(request, h) {
  const { id: sessionId } = await InitiateSessionService.go()

  return h.redirect(`/system/users/internal/setup/${sessionId}/enter-email`)
}

module.exports = {
  setup
}
