'use strict'

/**
 * Controller for /licence-monitoring-station/setup endpoints
 * @module LicenceMonitoringStationSetupController
 */

const InitiateSessionService = require('../services/licence-monitoring-station/setup/initiate-session.service.js')
const LicenceNumberService = require('../services/licence-monitoring-station/setup/licence-number.service.js')
const StopOrReduceService = require('../services/licence-monitoring-station/setup/stop-or-reduce.service.js')
const SubmitLicenceNumberService = require('../services/licence-monitoring-station/setup/submit-licence-number.service.js')
const SubmitStopOrReduceService = require('../services//licence-monitoring-station/setup/submit-stop-or-reduce.service.js')
const SubmitThresholdAndUnitService = require('../services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js')
const ThresholdAndUnitService = require('../services/licence-monitoring-station/setup/threshold-and-unit.service.js')

async function licenceNumber(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await LicenceNumberService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/licence-number.njk`, pageData)
}

async function submitLicenceNumber(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitLicenceNumberService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/licence-number.njk`, pageData)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/full-condition`)
}

async function submitSetup(request, h) {
  const { monitoringStationId } = request.payload

  const sessionId = await InitiateSessionService.go(monitoringStationId)

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`)
}

async function stopOrReduce(request, h) {
  const { sessionId } = request.params

  const pageData = await StopOrReduceService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/stop-or-reduce.njk`, pageData)
}

async function submitStopOrReduce(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitStopOrReduceService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/stop-or-reduce.njk`, pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/licence-number`)
}

async function submitThresholdAndUnit(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitThresholdAndUnitService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`)
}

async function thresholdAndUnit(request, h) {
  const { sessionId } = request.params

  const pageData = await ThresholdAndUnitService.go(sessionId)

  return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
}

module.exports = {
  licenceNumber,
  submitSetup,
  stopOrReduce,
  submitLicenceNumber,
  submitStopOrReduce,
  submitThresholdAndUnit,
  thresholdAndUnit
}
