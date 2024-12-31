'use strict'

/**
 * Controller for /return-logs-edit endpoints
 * @module ReturnLogsEditController
 */

const InitiateSessionService = require('../services/return-logs-edit/initiate-session.service.js')

const basePath = 'return-log-edit'

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/${basePath}/${session.id}/how-to-edit`)
}

module.exports = {
  setup
}
