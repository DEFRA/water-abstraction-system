'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const ConfirmationService = require('../services/return-logs/setup/confirmation.service.js')
const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')

async function confirmation(request, h) {
  const { sessionId } = request.params
  const pageData = await ConfirmationService.go(sessionId)

  return h.view('return-logs/setup/confirmation.njk', { ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/how-to-edit`)
}

module.exports = {
  confirmation,
  setup
}
