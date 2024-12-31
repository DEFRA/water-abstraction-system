'use strict'

/**
 * Controller for /return-logs-edit endpoints
 * @module ReturnLogsEditController
 */

const EditReturnLogService = require('../services/return-logs/edit-return-log.service.js')
const InitiateSessionService = require('../services/return-logs-edit/initiate-session.service.js')

const basePath = 'return-log-edit'

async function edit(request, h) {
  const { returnLogId } = request.query
  const pageData = await EditReturnLogService.go(returnLogId)

  return h.view('return-logs-edit/how-to-edit.njk', { activeNavBar: 'search', ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/${basePath}/${session.id}/how-to-edit`)
}

async function submitEdit(request, h) {
  const { returnLogId } = request.query
  const { howToEdit } = request.payload

  const pageData = await EditReturnLogService.go(returnLogId)

  if (!howToEdit) {
    return h.view('return-logs-edit/how-to-edit.njk', {
      activeNavBar: 'search',
      error: { text: 'Select how would you like to edit this return' },
      ...pageData
    })
  }

  if (howToEdit === 'query') {
    // TODO: Set/unset the query flag
  }

  return h.redirect(`/system/return-logs/edit/${howToEdit}?returnLogId=${returnLogId}`)
}

module.exports = {
  edit,
  setup,
  submitEdit
}
