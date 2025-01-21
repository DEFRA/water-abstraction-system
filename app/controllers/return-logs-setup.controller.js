'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const MeterProvidedService = require('../services/return-logs/setup/meter-provided.service.js')
const ReceivedService = require('../services/return-logs/setup/received.service.js')
const ReportedService = require('../services/return-logs/setup/reported.service.js')
const StartService = require('../services/return-logs/setup/start.service.js')
const SubmitMeterProvidedService = require('../services/return-logs/setup/submit-meter-provided.service.js')
const SubmitReceivedService = require('../services/return-logs/setup/submit-received.service.js')
const SubmitReportedService = require('../services/return-logs/setup/submit-reported.service.js')
const SubmitStartService = require('../services/return-logs/setup/submit-start.service.js')
const SubmitUnitsService = require('../services/return-logs/setup/submit-units.service.js')
const UnitsService = require('../services/return-logs/setup/units.service.js')

async function guidance(_request, h) {
  return h.view('return-logs/setup/guidance.njk')
}

async function meterProvided(request, h) {
  const { sessionId } = request.params
  const pageData = await MeterProvidedService.go(sessionId)

  return h.view('return-logs/setup/meter-provided.njk', pageData)
}

async function received(request, h) {
  const { sessionId } = request.params
  const pageData = await ReceivedService.go(sessionId)

  return h.view('return-logs/setup/received.njk', pageData)
}

async function reported(request, h) {
  const { sessionId } = request.params
  const pageData = await ReportedService.go(sessionId)

  return h.view('return-logs/setup/reported.njk', pageData)
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/received`)
}

async function start(request, h) {
  const { sessionId } = request.params
  const pageData = await StartService.go(sessionId)

  return h.view('return-logs/setup/start.njk', pageData)
}

async function submitMeterProvided(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitMeterProvidedService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/meter-provided.njk', pageData)
  }

  if (pageData.meterProvided === 'no') {
    return h.redirect(`/system/return-logs/setup/${sessionId}/meter-readings`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-details`)
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

  return h.redirect(`/system/return-logs/setup/${sessionId}/start`)
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

async function submitStart(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitStartService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/start.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/reported`)
}

async function submitUnits(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitUnitsService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/units.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-provided`)
}

async function units(request, h) {
  const { sessionId } = request.params
  const pageData = await UnitsService.go(sessionId)

  return h.view('return-logs/setup/units.njk', pageData)
}

module.exports = {
  guidance,
  meterProvided,
  received,
  reported,
  setup,
  start,
  submitMeterProvided,
  submitReceived,
  submitReported,
  submitStart,
  submitUnits,
  units
}
