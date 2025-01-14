'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const ReceivedService = require('../services/return-logs/setup/received.service.js')
const StartService = require('../services/return-logs/setup/start.service.js')
const SubmitReceivedService = require('../services/return-logs/setup/submit-received.service.js')
const SubmitStartService = require('../services/return-logs/setup/submit-start.service.js')

async function received(request, h) {
  const { sessionId } = request.params
  const pageData = await ReceivedService.go(sessionId)

  return h.view('return-logs/setup/received.njk', { ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/start`)
}

async function start(request, h) {
  const { sessionId } = request.params
  const pageData = await StartService.go(sessionId)

  return h.view('return-logs/setup/start.njk', pageData)
}

async function submitReceived(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitReceivedService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/received.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/reported`)
}

async function submitStart(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitStartService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/start.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/received`)
}

module.exports = {
  received,
  setup,
  start,
  submitReceived,
  submitStart
}
