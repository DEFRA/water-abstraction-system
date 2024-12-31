'use strict'

/**
 * Controller for /return-logs-edit endpoints
 * @module ReturnLogsEditController
 */

const EditReturnLogService = require('../services/return-logs-edit/edit-return-log.service.js')
const InitiateSessionService = require('../services/return-logs-edit/initiate-session.service.js')
const SubmitEditReturnLogService = require('../services/return-logs-edit/submit-edit-return-log.service.js')

const basePath = '/system/return-log-edit'

async function edit(request, h) {
  const { sessionId } = request.params
  const pageData = await EditReturnLogService.go(sessionId)

  return h.view('return-logs-edit/how-to-edit.njk', { activeNavBar: 'search', ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`${basePath}/${session.id}/how-to-edit`)
}

async function submitEdit(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitEditReturnLogService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs-edit/how-to-edit.njk', {
      activeNavBar: 'search',
      ...pageData
    })
  }

  return h.redirect(`${basePath}/${sessionId}/${pageData.howToEdit}`)
}

module.exports = {
  edit,
  setup,
  submitEdit
}
