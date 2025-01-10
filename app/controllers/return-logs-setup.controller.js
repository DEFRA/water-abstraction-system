'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const ReceivedService = require('../services/return-logs/setup/received.service.js')
const ReportedService = require('../services/return-logs/setup/reported.service.js')
const SubmitReceivedService = require('../services/return-logs/setup/submit-received.service.js')
const SubmitReportedService = require('../services/return-logs/setup/submit-reported.service.js')

async function received(request, h) {
  const { sessionId } = request.params
  const pageData = await ReceivedService.go(sessionId)

  return h.view('return-logs/setup/received.njk', { ...pageData })
}

async function reported(request, h) {
  const { sessionId } = request.params
  const pageData = await ReportedService.go(sessionId)

  return h.view('return-logs/setup/reported.njk', { ...pageData })
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/how-to-edit`)
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

async function submitReported(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitReportedService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/reported.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/units`)
}

module.exports = {
  received,
  reported,
  setup,
  submitReceived,
  submitReported
}
