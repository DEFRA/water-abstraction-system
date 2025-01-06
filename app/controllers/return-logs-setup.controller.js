'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const EditReturnLogService = require('../services/return-logs/setup/edit-return-log.service.js')
const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const SubmitEditReturnLogService = require('../services/return-logs/setup/submit-edit-return-log.service.js')

async function edit(request, h) {
  const { sessionId } = request.params
  const pageData = await EditReturnLogService.go(sessionId)

  return h.view('return-logs/setup/how-to-edit.njk', { activeNavBar: 'search', ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/how-to-edit`)
}

async function submitEdit(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitEditReturnLogService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/how-to-edit.njk', {
      activeNavBar: 'search',
      ...pageData
    })
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/${pageData.howToEdit}`)
}

module.exports = {
  edit,
  setup,
  submitEdit
}
