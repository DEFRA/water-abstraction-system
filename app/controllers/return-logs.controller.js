'use strict'

const ConfirmationService = require('../services/return-logs/confirmation.service.js')
const EditReturnLogService = require('../services/return-logs/edit-return-log.service.js')

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

async function edit(request, h) {
  const { returnLogId } = request.query
  const pageData = await EditReturnLogService.go(returnLogId)

  return h.view('return-logs/edit.njk', { activeNavBar: 'search', ...pageData })
}

async function confirmation(request, h) {
  const { returnLogId } = request.query
  const pageData = await ConfirmationService.go(returnLogId)

  return h.view('return-logs/confirmation.njk', { activeNavBar: 'search', ...pageData })
}

module.exports = {
  confirmation,
  edit
}
