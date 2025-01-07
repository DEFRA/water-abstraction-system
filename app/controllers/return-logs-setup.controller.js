'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const StartService = require('../services/return-logs/setup/start.js')
const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const SubmitStartService = require('../services/return-logs/setup/submit-start.service.js')

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/start`)
}

async function start(request, h) {
  const { sessionId } = request.params
  const pageData = await StartService.go(sessionId)

  return h.view('return-logs/setup/start.njk', { activeNavBar: 'search', ...pageData })
}

async function submitStart(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitStartService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/start.njk', {
      activeNavBar: 'search',
      ...pageData
    })
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/${pageData.whatToDo}`)
}

module.exports = {
  setup,
  start,
  submitStart
}
