'use strict'

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

async function submitEdit(request, h) {
  const { returnLogId } = request.query
  const { howToEdit } = request.payload

  const pageData = await EditReturnLogService.go(returnLogId)

  if (!howToEdit) {
    return h.view('return-logs/edit.njk', {
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
  submitEdit
}
